import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Star, Loader2, Quote, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

export default function AdminTestimonials() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ customer_name: '', location: '', review: '', rating: '5', avatar: '', is_active: true, display_order: '1' })

  const { data: items = [], isLoading } = useQuery({
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

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('testimonials').update({ is_active: !is_active }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white transition-colors'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(items as any[]).filter((t: any) => t.is_active).length} of {(items as any[]).length} shown on the homepage
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading testimonials…</p>
        </div>
      ) : (items as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Quote className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No testimonials yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Happy customer reviews build trust with new visitors. Add your first testimonial to showcase it on the homepage.
          </p>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm mt-5">
            <Plus className="w-4 h-4" /> Add your first testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(items as any[]).map((t: any) => (
            <div key={t.id} className={`bg-white rounded-xl border border-border p-5 flex flex-col shadow-sm hover:shadow-md transition-all ${!t.is_active ? 'opacity-60' : ''}`}>
              {/* Rating + status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= t.rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-border'}`} />
                  ))}
                </div>
                <button
                  onClick={() => toggleActive.mutate({ id: t.id, is_active: t.is_active })}
                  title={t.is_active ? 'Click to hide from site' : 'Click to show on site'}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${t.is_active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-red-100 text-red-700 hover:bg-green-50 hover:text-green-700'}`}
                >
                  {t.is_active ? 'Active' : 'Hidden'}
                </button>
              </div>

              {/* Review */}
              <div className="relative flex-1">
                <Quote className="w-5 h-5 text-primary/20 absolute -top-1 -left-1" />
                <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-4 pl-4">"{t.review}"</p>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.customer_name} className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold flex-shrink-0">
                    {(t.customer_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{t.customer_name}</p>
                  {t.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {t.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openForm(t)} className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.confirm(`Delete testimonial from "${t.customer_name}"?`) && del.mutate(t.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 bg-black/60 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif font-semibold text-lg">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Customer Name *</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="e.g. Priya Sharma" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Mumbai" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Review *</label>
                <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} placeholder="What did the customer say?" rows={4} className={`${inputCls} resize-none`} />
              </div>

              <ImageUpload value={form.avatar} onChange={url => setForm(f => ({ ...f, avatar: url }))} bucket="media" folder="testimonials" label="Customer Photo (optional)" aspect="square" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Rating</label>
                  <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className={inputCls}>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} — {r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Display Order</label>
                  <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} type="number" min="1" className={inputCls} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                Active (show on website)
              </label>

              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                  : editing ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
