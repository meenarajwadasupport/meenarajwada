import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', mrp: '', material: '', sizes: '', images: '', stock: '10', is_active: true, is_featured: false, is_new_arrival: false, is_bestseller: false, is_customizable: false })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  function openForm(product?: any) {
    if (product) {
      setEditing(product)
      setForm({ name: product.name, slug: product.slug, description: product.description ?? '', price: product.price, mrp: product.mrp, material: product.material ?? '', sizes: product.sizes?.join(', ') ?? '', images: product.images?.join('\n') ?? '', stock: product.stock, is_active: product.is_active, is_featured: product.is_featured, is_new_arrival: product.is_new_arrival, is_bestseller: product.is_bestseller, is_customizable: product.is_customizable })
    } else {
      setEditing(null)
      setForm({ name: '', slug: '', description: '', price: '', mrp: '', material: '', sizes: '', images: '', stock: '10', is_active: true, is_featured: false, is_new_arrival: false, is_bestseller: false, is_customizable: false })
    }
    setShowForm(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description, price: Number(form.price), mrp: Number(form.mrp) || Number(form.price),
        material: form.material,
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        stock: Number(form.stock),
        is_active: form.is_active, is_featured: form.is_featured, is_new_arrival: form.is_new_arrival,
        is_bestseller: form.is_bestseller, is_customizable: form.is_customizable,
      }
      if (editing) { await supabase.from('products').update(payload).eq('id', editing.id) }
      else { await supabase.from('products').insert(payload) }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product saved'); setShowForm(false) },
    onError: () => toast.error('Could not save product'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('products').delete().eq('id', id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Deleted') },
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'
  const checkCls = 'flex items-center gap-2 text-sm cursor-pointer'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Products</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background">
              <tr>{['Product', 'Price', 'Stock', 'Active', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg" />}
                      <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.material}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openForm(p)} className="p-1.5 hover:bg-background rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => confirm('Delete?') && deleteMutation.mutate(p.id)} className="p-1.5 hover:bg-background rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl my-4">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product Name" className={inputCls} />
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Slug (auto-generated if empty)" className={inputCls} />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-3 gap-2">
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price (₹)" type="number" className={inputCls} />
                <input value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="MRP (₹)" type="number" className={inputCls} />
                <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="Stock" type="number" className={inputCls} />
              </div>
              <input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Material (e.g. Kundan)" className={inputCls} />
              <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="Sizes (comma-separated: 2.4, 2.6, Free Size)" className={inputCls} />
              <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="Image URLs (one per line)" rows={3} className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ['is_active', 'Active'],
                  ['is_featured', 'Featured'],
                  ['is_new_arrival', 'New Arrival'],
                  ['is_bestseller', 'Bestseller'],
                  ['is_customizable', 'Customizable'],
                ].map(([key, label]) => (
                  <label key={key} className={checkCls}>
                    <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-primary" />
                    {label}
                  </label>
                ))}
              </div>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">
                {saveMutation.isPending ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
