import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload, Search, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ── Image compression ────────────────────────────────────────────────────────
async function compressToWebP(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      c.toBlob(b => resolve(b!), 'image/webp', quality)
    }
    img.src = url
  })
}

function isBucketMissing(err: any) {
  return (err?.message ?? '').toLowerCase().includes('bucket') || err?.statusCode === 404
}

async function uploadProductImage(file: File): Promise<string> {
  const blob = await compressToWebP(file)
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
  let { data, error } = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/webp', upsert: true })
  if (error && isBucketMissing(error)) {
    try {
      await fetch('/api/setup-storage', { method: 'POST' })
      const retry = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/webp', upsert: true })
      data = retry.data; error = retry.error
    } catch { /* ignore */ }
  }
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return supabase.storage.from('products').getPublicUrl(data!.path).data.publicUrl
}

// ── Sync in_hero_slider flag to hero_slides table ───────────────────────────
async function syncHeroSlide(product: any, enable: boolean) {
  if (enable && product.images?.[0]) {
    // Upsert a slide for this product (keyed by product id in cta_url)
    const existing = await supabase.from('hero_slides').select('id').eq('cta_url', `/product/${product.slug}`).maybeSingle()
    if (!existing.data) {
      await supabase.from('hero_slides').insert({
        title: product.name,
        subtitle: product.material ?? '',
        image_url: product.images[0],
        cta_text: 'Shop Now',
        cta_url: `/product/${product.slug}`,
        display_order: 99,
        is_active: true,
      })
    }
  } else if (!enable) {
    // Remove slide for this product if it exists
    if (product.slug) {
      await supabase.from('hero_slides').delete().eq('cta_url', `/product/${product.slug}`)
    }
  }
}

// ── Blank form ───────────────────────────────────────────────────────────────
const BLANK: Record<string, any> = {
  name: '', slug: '', description: '', price: '', mrp: '', material: '',
  category_id: '', sizes: '', stock: '10',
  is_active: true, is_featured: false, is_new_arrival: false,
  is_bestseller: false, is_customizable: false, in_hero_slider: false,
}

const FLAGS = [
  { key: 'is_active',      label: 'Active' },
  { key: 'is_featured',    label: 'Featured' },
  { key: 'is_new_arrival', label: 'New Arrival' },
  { key: 'is_bestseller',  label: 'Bestseller' },
  { key: 'is_customizable',label: 'Customizable' },
  { key: 'in_hero_slider', label: 'Add to Hero Slider' },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, any>>(BLANK)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id,name,slug').order('display_order')
      return data ?? []
    },
  })

  function openForm(p?: any) {
    if (p) {
      setEditing(p)
      setForm({
        name: p.name ?? '', slug: p.slug ?? '', description: p.description ?? '',
        price: String(p.price ?? ''), mrp: String(p.mrp ?? ''), material: p.material ?? '',
        category_id: p.category_id ?? '',
        sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes ?? ''),
        stock: String(p.stock ?? '10'),
        is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
        is_new_arrival: p.is_new_arrival ?? false, is_bestseller: p.is_bestseller ?? false,
        is_customizable: p.is_customizable ?? false, in_hero_slider: p.in_hero_slider ?? false,
      })
      setImages(p.images ?? [])
    } else {
      setEditing(null); setForm(BLANK); setImages([])
    }
    setShowForm(true)
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      try { urls.push(await uploadProductImage(file)) }
      catch (e: any) { toast.error(e.message ?? `Upload failed: ${file.name}`) }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
    if (urls.length) toast.success(`${urls.length} image(s) uploaded`)
  }

  const saveProduct = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Product name is required')
      if (!form.price) throw new Error('Price is required')
      const cat = (categories as any[]).find(c => c.id === form.category_id)
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const payload = {
        name: form.name.trim(), slug,
        description: form.description.trim(),
        price: Number(form.price), mrp: Number(form.mrp) || Number(form.price),
        material: form.material.trim(),
        category_id: form.category_id || null,
        category_slug: cat?.slug ?? null,
        sizes: form.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        images, colors: [],
        stock: Number(form.stock),
        is_active: form.is_active, is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival, is_bestseller: form.is_bestseller,
        is_customizable: form.is_customizable, in_hero_slider: form.in_hero_slider,
      }
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        // Sync hero slider if in_hero_slider changed
        if (editing.in_hero_slider !== form.in_hero_slider || form.in_hero_slider) {
          await syncHeroSlide({ ...editing, ...payload }, form.in_hero_slider)
        }
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        if (form.in_hero_slider && data) await syncHeroSlide(data, true)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
      toast.success(editing ? 'Product updated ✓' : 'Product added ✓')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not save product'),
  })

  const deleteProduct = useMutation({
    mutationFn: async (p: any) => {
      if (p.in_hero_slider) await syncHeroSlide(p, false)
      const { error } = await supabase.from('products').delete().eq('id', p.id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Deleted') },
    onError: () => toast.error('Could not delete'),
  })

  const filtered = (products as any[]).filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.material?.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} products</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary bg-white" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-background/50">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Tags', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                          : <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                        <div>
                          <p className="font-semibold leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {(categories as any[]).find(c => c.id === p.category_id)?.name ?? p.category_slug ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-primary">{formatPrice(p.price)}</p>
                      {p.mrp > p.price && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.is_active     && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                        {p.is_bestseller && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Best</span>}
                        {p.is_featured   && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Feat</span>}
                        {p.is_new_arrival && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">New</span>}
                        {p.in_hero_slider && <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">Hero</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openForm(p)} className="p-1.5 hover:bg-background rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => window.confirm(`Delete "${p.name}"?`) && deleteProduct.mutate(p)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

              {/* Images */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Product Images</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <X className="w-5 h-5 text-white" />
                      </button>
                      {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5">Main</span>}
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-primary disabled:opacity-50">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span className="text-[9px] font-medium">{uploading ? '...' : 'Upload'}</span>
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => e.target.files && handleImageUpload(e.target.files)} />
                <p className="text-[10px] text-muted-foreground mt-1.5">First image is the main product photo. Auto-compressed to WebP.</p>
              </div>

              {/* Name + Slug */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kundan Necklace Set" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Slug (auto)</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated from name" className={inputCls} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the product…" rows={3} className={`${inputCls} resize-none`} />
              </div>

              {/* Price + MRP + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Price ₹ *</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="1850" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">MRP ₹</label>
                  <input value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} type="number" placeholder="2400" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Stock</label>
                  <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} type="number" className={inputCls} />
                </div>
              </div>

              {/* Material + Category */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Material / Type</label>
                  <input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Kundan, Silk Thread, Meenakari…" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Category</label>
                  {/* key forces re-render when categories load so correct option is selected */}
                  <select
                    key={`cat-${(categories as any[]).length}-${form.category_id}`}
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">— Select Category —</option>
                    {(categories as any[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Sizes / Variants (comma-separated)</label>
                <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
                  placeholder="Free Size, 2.4, 2.6, 2.8, S, M, L" className={inputCls} />
              </div>

              {/* Flags */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Product Tags</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                  {FLAGS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={!!form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className="accent-primary w-4 h-4 flex-shrink-0" />
                      <span className={key === 'in_hero_slider' ? 'text-rose-700 font-semibold' : ''}>{label}</span>
                    </label>
                  ))}
                </div>
                {form.in_hero_slider && (
                  <p className="text-[10px] text-rose-600 mt-2 bg-rose-50 rounded-lg px-3 py-2">
                    ✦ This product will automatically appear as a slide in the homepage hero section using its first image.
                  </p>
                )}
              </div>

              {/* Save */}
              <button
                onClick={() => saveProduct.mutate()}
                disabled={saveProduct.isPending || !form.name || !form.price}
                className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60"
              >
                {saveProduct.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span> : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
