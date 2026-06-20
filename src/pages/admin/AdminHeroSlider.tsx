import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminHeroSlider() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', cta_text: '', cta_url: '', display_order: '1', is_active: true })

  const { data: slides = [] } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => { const { data } = await supabase.from('hero_slides').select('*').order('display_order'); return data ?? [] },
  })

  function openForm(s?: any) {
    if (s) { setEditing(s); setForm({ title: s.title, subtitle: s.subtitle ?? '', image_url: s.image_url, cta_text: s.cta_text ?? '', cta_url: s.cta_url ?? '', display_order: s.display_order, is_active: s.is_active }) }
    else { setEditing(null); setForm({ title: '', subtitle: '', image_url: '', cta_text: '', cta_url: '', display_order: '1', is_active: true }) }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const p = { title: form.title, subtitle: form.subtitle, image_url: form.image_url, cta_text: form.cta_text, cta_url: form.cta_url, display_order: Number(form.display_order), is_active: form.is_active }
      if (editing) await supabase.from('hero_slides').update(p).eq('id', editing.id)
      else await supabase.from('hero_slides').insert(p)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-hero-slides'] }); toast.success('Saved'); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: async (id: string) => supabase.from('hero_slides').delete().eq('id', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-hero-slides'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Hero Slider</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4" /> Add Slide</button>
      </div>
      <div className="space-y-4">
        {slides.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl border border-border overflow-hidden flex gap-4 p-4">
            <img src={s.image_url} alt="" className="w-32 h-20 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.subtitle}</p>
              <p className="text-xs text-primary mt-1">{s.cta_text} → {s.cta_url}</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{s.is_active ? 'Active' : 'Off'}</span>
              <button onClick={() => openForm(s)}><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del.mutate(s.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {!slides.length && <p className="text-muted-foreground">No slides yet.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between mb-4"><h2 className="font-semibold">{editing ? 'Edit' : 'New'} Slide</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <textarea value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Slide Title (use \n for line break)" rows={2} className={`${inputCls} resize-none`} />
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle" className={inputCls} />
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className={inputCls} />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Button Text" className={inputCls} />
                <input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="Button URL" className={inputCls} />
              </div>
              <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="Display Order" type="number" className={inputCls} />
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary" />Active</label>
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save Slide'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
