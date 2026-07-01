import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload, Search, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

// Compress image to WebP before upload
async function compressToWebP(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', quality)
    }
    img.src = url
  })
}

async function ensureBucket(bucket: string) {
  const { error } = await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 10485760 })
  if (error && !error.message?.toLowerCase().includes('already exist')) throw error
}

const BLANK_FORM = {
  name: '', slug: '', description: '', price: '', mrp: '', material: '',
  category_id: '', sizes: '', stock: '10',
  is_active: true, is_featured: false, is_new_arrival: false,
  is_bestseller: false, is_customizable: false, in_hero_slider: false,
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  // Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  // Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id,name,slug').order('display_order')
      return data ?? []
    },
  })

  function openForm(product?: any) {
    if (product) {
      setEditing(product)
      setForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        price: product.price ?? '',
        mrp: product.mrp ?? '',
        material: product.material ?? '',
        category_id: product.category_id ?? '',
        sizes: product.sizes?.join(', ') ?? '',
        stock: product.stock ?? '10',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new_arrival: product.is_new_arrival ?? false,
        is_bestseller: product.is_bestseller ?? false,
        is_customizable: product.is_customizable ?? false,
        in_hero_slider: product.in_hero_slider ?? false,
      })
      setImages(product.images ?? [])
    } else {
      setEditing(null)
      setForm(BLANK_FORM)
      setImages([])
    }
    setShowForm(true)
  }

  // Upload images to Supabase Storage (compressed to WebP, auto-creates bucket)
  async function handleImageUpload(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    let bucketReady = false
    for (const file of Array.from(files)) {
      try {
        const blob = await compressToWebP(file)
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
        let { data, error } = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/webp', upsert: true })
        // Auto-create bucket if missing, then retry
        if (error && !bucketReady) {
          const msg = (error.message ?? '').toLowerCase()
          if (msg.includes('bucket') || (error as any).statusCode === 404) {
            await ensureBucket('products')
            bucketReady = true
            const retry = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/webp', upsert: true })
            data = retry.data; error = retry.error
          }
        }
        if (error) { toast.error(`Upload failed: ${file.name}`); continue }
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data!.path)
        urls.push(publicUrl)
      } catch (e: any) {
        toast.error(e.message ?? `Upload failed: ${file.name}`)
      }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
    if (urls.length) toast.success(`${urls.length} image(s) uploaded`)
  }

  const saveProduct = useMutation({
    mutationFn: async () => {
      const cat = (categories as any[]).find(c => c.id === form.category_id)
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: form.description.trim(),
        price: Number(form.price),
        mrp: Number(form.mrp) || Number(form.price),
        material: form.material.trim(),
        category_id: form.category_id || null,
        category_slug: cat?.slug ?? null,
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images,
        colors: [],
        stock: Number(form.stock),
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_bestseller: form.is_bestseller,
        is_customizable: form.is_customizable,
        in_hero_slider: form.in_hero_slider,
      }
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(editing ? 'Product updated' : 'Product added')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not save product'),
  })

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted') },
    onError: () => toast.error('Could not delete'),
  })

  const filtered = products.filter((p: any) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.material?.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'
  const FLAG_KEYS = [
    ['is_active', 'Active'], ['is_featured', 'Featured'], ['is_new_arrival', 'New Arrival'],
    ['is_bestseller', 'Bestseller'], ['is_customizable', 'Customizable'], ['in_hero_slider', 'In Hero Slider'],
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} products total</p>
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
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-background/50">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Flags', 'Actions'].map(h => (
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
                          : <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                        }
                        <div>
                          <p className="font-semibold leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.category_slug ?? '—'}</td>
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
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openForm(p)} className="p-1.5 hover:bg-background rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirm(`Delete "${p.name}"?`) && deleteProduct.mutate(p.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">

              {/* Images */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Product Images</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      ><X className="w-4 h-4 text-white" /></button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-primary"
                  >
                    {uploading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="text-[9px] font-medium">{uploading ? 'Uploading' : 'Upload'}</span>
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => e.target.files && handleImageUpload(e.target.files)} />
              </div>

              {/* Name + Slug */}
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product Name *" className={inputCls} />
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Slug (auto-generated)" className={inputCls} />
              </div>

              {/* Description */}
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description" rows={2} className={`${inputCls} resize-none`} />

              {/* Price + MRP + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price ₹ *" type="number" className={inputCls} />
                <input value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="MRP ₹" type="number" className={inputCls} />
                <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="Stock" type="number" className={inputCls} />
              </div>

              {/* Material + Category */}
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Material (e.g. Kundan, Silk Thread)" className={inputCls} />
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                  <option value="">— Select Category —</option>
                  {(categories as any[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Sizes */}
              <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
                placeholder="Sizes (comma-separated: 2.4, 2.6, 2.8, Free Size)" className={inputCls} />

              {/* Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-1">
                {FLAG_KEYS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="accent-primary w-4 h-4" />
                    {label}
                  </label>
                ))}
              </div>

              {/* Save */}
              <button
                onClick={() => saveProduct.mutate()}
                disabled={saveProduct.isPending || !form.name || !form.price}
                className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60"
              >
                {saveProduct.isPending ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
