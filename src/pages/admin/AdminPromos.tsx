import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

const BLANK = { title: '', subtitle: '', button_text: 'Shop Now', button_url: '/shop', image_url: '', accent_color: '#c0a060', display_order: '1', is_active: true }

export default function AdminPromos() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(BLANK)

  const { data: promos = [] } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: async () => {
      const { data } = await supabase.from('featured_promos').select('*').order('display_order')
      return data ?? []
    },
  })

  function openForm(promo?: any) {
    if (promo) {
      setEditing(promo)
      setForm({ title: promo.title, subtitle: promo.subtitle ?? '', button_text: promo.button_text ?? 'Shop Now', button_url: promo.button_url ?? '/shop', image_url: promo.image_url ?? '', accent_color: promo.accent_color ?? '#c0a060', display_order: promo.display_order, is_active: promo.is_active })
    } else {
      setEditing(null)
      setForm({ ...BLANK, display_order: String((promos.length ?? 0) + 1) })
    }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Title is required')
      const payload = { title: form.title.trim(), subtitle: form.subtitle.trim(), button_text: form.button_text.trim(), button_url: form.button_url.trim(), image_url: form.image_url, accent_color: form.accent_color, display_order: Number(form.display_order), is_active: form.is_active }
      if (editing) await supabase.from('featured_promos').update(payload).eq('id', editing.id)
      else await supabase.from('featured_promos').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); toast.success('Saved'); setShowForm(false) },
    onError: (e: any) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('featured_promos').delete().eq('id', id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); toast.success('Deleted') },
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Featured Promos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Promotional banners shown on the homepage</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(promos as any[]).map((promo) => (
          <div key={promo.id} className={`bg-white rounded-xl border overflow-hidden ${promo.is_active ? 'border-border' : 'border-border/40 opacity-60'}`}>
            {promo.image_url && (
              <div className="relative h-36 bg-muted overflow-hidden">
                <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                  <p className="text-white font-bold text-sm leading-tight">{promo.title}</p>
                  {promo.subtitle && <p className="text-white/80 text-xs mt-0.5">{promo.subtitle}</p>}
                </div>
                {promo.accent_color && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: promo.accent_color }} />
                )}
              </div>
            )}
            {!promo.image_url && (
              <div className="h-24 flex items-center justify-center" style={{ background: promo.accent_color ?? '#c0a060' }}>
                <div className="text-center text-white">
                  <p className="font-bold">{promo.title}</p>
                  {promo.subtitle && <p className="text-xs opacity-80">{promo.subtitle}</p>}
                </div>
              </div>
            )}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {promo.is_active ? 'Active' : 'Hidden'}
                </span>
                <span className="text-xs text-muted-foreground">Order #{promo.display_order}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openForm(promo)} className="p-1.5 hover:bg-background rounded"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del.mutate(promo.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {!(promos as any[]).length && (
          <div className="col-span-2 text-center py-16 text-muted-foreground text-sm">
            No promos yet. Add a featured promo to highlight collections on your homepage.
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Promo' : 'New Promo'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
                bucket="media"
                folder="promos"
                label="Promo Image"
                aspect="wide"
              />
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title *" className={inputCls} />
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle (optional)" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} placeholder="Button Text" className={inputCls} />
                <input value={form.button_url} onChange={e => setForm(f => ({ ...f, button_url: e.target.value }))} placeholder="Button URL" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} className="w-10 h-10 rounded border border-border cursor-pointer p-0.5" />
                    <input value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="Display Order" type="number" min="1" className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                Active (visible on website)
              </label>
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">
                {save.isPending ? 'Saving…' : 'Save Promo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
