import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

const BLANK = { title: '', subtitle: '', image_url: '', video_url: '', cta_text: 'Shop Now', cta_url: '/shop', display_order: '1', is_active: true }

export default function AdminHeroSlider() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(BLANK)

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })

  function openForm(s?: any) {
    if (s) {
      setEditing(s)
      setForm({
        title: s.title ?? '', subtitle: s.subtitle ?? '',
        image_url: s.image_url ?? '', video_url: s.video_url ?? '',
        cta_text: s.cta_text ?? 'Shop Now', cta_url: s.cta_url ?? '/shop',
        display_order: String(s.display_order ?? 1), is_active: s.is_active ?? true,
      })
    } else {
      setEditing(null)
      // Auto next order
      const maxOrder = (slides as any[]).reduce((m: number, s: any) => Math.max(m, s.display_order ?? 0), 0)
      setForm({ ...BLANK, display_order: String(maxOrder + 1) })
    }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Title is required')
      if (!form.image_url) throw new Error('Please upload a slide image first')
      const payload = {
        title: form.title.trim(), subtitle: form.subtitle.trim(),
        image_url: form.image_url, video_url: form.video_url.trim() || null,
        cta_text: form.cta_text.trim(), cta_url: form.cta_url.trim(),
        display_order: Number(form.display_order) || 1,
        is_active: form.is_active,
      }
      if (editing) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editing.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload)
        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      toast.success(editing ? 'Slide updated ✓' : 'Slide added ✓')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not save slide'),
  })

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
      toast.success('Slide deleted')
    },
    onError: (e: any) => toast.error(e.message),
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('hero_slides').update({ is_active: !is_active }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const reorder = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: 'up' | 'down' }) => {
      const list = slides as any[]
      const idx = list.findIndex(s => s.id === id)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= list.length) return
      const [a, b] = [list[idx], list[swapIdx]]
      await supabase.from('hero_slides').update({ display_order: b.display_order }).eq('id', a.id)
      await supabase.from('hero_slides').update({ display_order: a.display_order }).eq('id', b.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] })
      qc.invalidateQueries({ queryKey: ['hero-slides'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Hero Slider</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(slides as any[]).filter((s: any) => s.is_active).length} active slide(s) · shown in order on homepage
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {/* Info tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        Use the <strong>↑ ↓ arrows</strong> to set the slide order. <strong>#1</strong> appears first on the homepage.
        Products with "Add to Hero Slider" checked automatically appear here.
      </div>

      {/* Slides list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (slides as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground text-sm">
          No slides yet. Click "Add Slide" to create your first hero banner.
        </div>
      ) : (
        <div className="space-y-3">
          {(slides as any[]).map((s: any, idx: number) => (
            <div key={s.id} className={`bg-white rounded-xl border overflow-hidden flex gap-0 transition-opacity ${!s.is_active ? 'opacity-60' : 'border-border'}`}>
              {/* Order controls */}
              <div className="flex flex-col items-center justify-center gap-1 px-3 border-r border-border bg-background/50">
                <button
                  onClick={() => reorder.mutate({ id: s.id, dir: 'up' })}
                  disabled={idx === 0}
                  className="p-1 hover:bg-muted rounded-lg disabled:opacity-20 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                <button
                  onClick={() => reorder.mutate({ id: s.id, dir: 'down' })}
                  disabled={idx === (slides as any[]).length - 1}
                  className="p-1 hover:bg-muted rounded-lg disabled:opacity-20 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              {s.image_url
                ? <img src={s.image_url} alt="" className="w-28 sm:w-36 h-24 object-cover flex-shrink-0" />
                : <div className="w-28 sm:w-36 h-24 bg-muted flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">No image</div>
              }

              {/* Info */}
              <div className="flex-1 min-w-0 p-3">
                <p className="font-semibold text-sm truncate">{s.title}</p>
                {s.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.subtitle}</p>}
                {s.video_url && <p className="text-[10px] text-blue-600 mt-0.5">📹 Has video background</p>}
                {s.cta_text && (
                  <p className="text-xs text-primary mt-1 truncate">
                    Button: <span className="font-medium">{s.cta_text}</span> → {s.cta_url}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end justify-between p-3 gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive.mutate({ id: s.id, is_active: s.is_active })}
                  title={s.is_active ? 'Hide slide' : 'Show slide'}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${s.is_active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700'}`}
                >
                  {s.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {s.is_active ? 'Active' : 'Hidden'}
                </button>
                <div className="flex gap-1.5">
                  <button onClick={() => openForm(s)} className="p-1.5 hover:bg-background rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.confirm(`Delete "${s.title}"?`) && del.mutate(s.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
                bucket="media" folder="hero-slides"
                label="Slide Image *"
                aspect="wide"
              />

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Title *</label>
                <textarea value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. New Collection Arrived" rows={2} className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="e.g. Handcrafted with love" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Background Video URL (optional)</label>
                <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://...mp4 — loops behind the image" className={inputCls} />
                <p className="text-[10px] text-muted-foreground mt-1">Image shows on mobile / while video loads.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Button Text</label>
                  <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
                    placeholder="Shop Now" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Button URL</label>
                  <input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))}
                    placeholder="/shop" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Position (#1 = first)</label>
                  <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                    type="number" min="1" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                  Active (show on website)
                </label>
              </div>

              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                  : editing ? 'Update Slide' : 'Add Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
