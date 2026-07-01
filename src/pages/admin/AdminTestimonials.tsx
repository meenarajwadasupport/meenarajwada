import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

export default function AdminTestimonials() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ customer_name: '', location: '', review: '', rating: '5', avatar: '', is_active: true, display_order: '1' })

  const { data: items = [] } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => { const { data } = await supabase.from('testimonials').select('*').order('display_order'); return data ?? [] },
  })

  function openForm(t?: any) {
    if (t) { setEditing(t); setForm({ customer_name: t.customer_name, location: t.location ?? '', review: t.review, rating: t.rating, avatar: t.avatar ?? '', is_active: t.is_active, display_order: t.display_order }) }
    else { setEditing(null); setForm({ customer_name: '', location: '', review: '', rating: '5', avatar: '', is_active: true, display_order: '1' }) }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const p = { customer_name: form.customer_name, location: form.location, review: form.review, rating: Number(form.rating), avatar: form.avatar, is_active: form.is_active, display_order: Number(form.display_order) }
      if (editing) await supabase.from('testimonials').update(p).eq('id', editing.id)
      else await supabase.from('testimonials').insert(p)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); toast.success('Saved'); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('testimonials').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Testimonials</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t: any) => (
          <div key={t.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex gap-1 mb-2">{Array.from({ length: t.rating }).map((_,i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}</div>
            <p className="text-sm text-muted-foreground line-clamp-3 italic">"{t.review}"</p>
            <p className="text-sm font-semibold mt-2">{t.customer_name}</p>
            <p className="text-xs text-muted-foreground">{t.location}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openForm(t)} className="p-1.5 hover:bg-background rounded"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del.mutate(t.id)} className="p-1.5 hover:bg-background rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4"><h2 className="font-semibold">{editing ? 'Edit' : 'New'} Testimonial</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Customer Name" className={inputCls} />
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location (e.g. Mumbai)" className={inputCls} />
              <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} placeholder="Review text" rows={4} className={`${inputCls} resize-none`} />
              <ImageUpload value={form.avatar} onChange={url => setForm(f => ({ ...f, avatar: url }))} bucket="media" folder="testimonials" label="Customer Photo (optional)" aspect="square" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className={inputCls}>{[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}</select>
                <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="Order" type="number" className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary" />Active</label>
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
