import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Pencil, X, ArrowUp, ArrowDown, Loader2, Eye, EyeOff, Info } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import VideoUpload from '@/components/admin/VideoUpload'
import { hasCfWorker, cfCreateFeaturedCollection, cfUpdateFeaturedCollection, cfDeleteFeaturedCollection } from '@/lib/cfApi'

// Fallback seeded data shown if DB table doesn't exist yet
const FALLBACK = [
  { label: 'Bridal',   title: 'Bridal Bangle Set',   price: 'From ₹2,499', url: '/category/bridal',           display_order: 1, is_active: true, image_url: '', video_url: '' },
  { label: 'Heritage', title: 'Rajwada Heritage',     price: 'From ₹1,899', url: '/category/rajwada-heritage', display_order: 2, is_active: true, image_url: '', video_url: '' },
  { label: 'Custom',   title: 'Made Just for You',    price: 'From ₹999',   url: '/customize',                 display_order: 3, is_active: true, image_url: '', video_url: '' },
  { label: 'Festive',  title: 'Festive Collection',   price: 'From ₹799',   url: '/category/festive',          display_order: 4, is_active: true, image_url: '', video_url: '' },
]

const BLANK = { label: '', title: '', price: '', url: '', image_url: '', video_url: '', display_order: '1', is_active: true }

export default function AdminCollections() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<typeof BLANK>(BLANK)
  const [dbMissing, setDbMissing] = useState(false)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_collections')
        .select('*')
        .order('display_order')
      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          setDbMissing(true)
          return FALLBACK
        }
        throw error
      }
      setDbMissing(false)
      return (data?.length ? data : FALLBACK) as any[]
    },
  })

  function openForm(item?: any) {
    if (item) {
      setEditing(item)
      setForm({
        label: item.label ?? '',
        title: item.title ?? '',
        price: item.price ?? '',
        url: item.url ?? '',
        image_url: item.image_url ?? '',
        video_url: item.video_url ?? '',
        display_order: String(item.display_order ?? 1),
        is_active: item.is_active ?? true,
      })
    } else {
      setEditing(null)
      const maxOrder = (items as any[]).reduce((m: number, i: any) => Math.max(m, i.display_order ?? 0), 0)
      setForm({ ...BLANK, display_order: String(maxOrder + 1) })
    }
    setShowForm(true)
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? ''
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Title is required')
      if (!form.image_url && !form.video_url) throw new Error('Please upload an image or video')
      const payload = {
        label: form.label.trim(),
        title: form.title.trim(),
        price: form.price.trim(),
        url: form.url.trim() || '/',
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        display_order: Number(form.display_order) || 1,
        is_active: form.is_active,
      }
      if (editing?.id) {
        const { error } = await supabase.from('featured_collections').update(payload).eq('id', editing.id)
        if (error) throw new Error(error.message)
        if (hasCfWorker()) { const token = await getToken(); cfUpdateFeaturedCollection(editing.id, payload, token).catch(() => {}) }
      } else {
        const { data, error } = await supabase.from('featured_collections').insert(payload).select().single()
        if (error) throw new Error(error.message)
        if (hasCfWorker() && data) { const token = await getToken(); cfCreateFeaturedCollection({ ...payload, id: data.id }, token).catch(() => {}) }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] })
      qc.invalidateQueries({ queryKey: ['featured-collections'] })
      toast.success(editing ? 'Card updated ✓' : 'Card added ✓')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not save'),
  })

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('featured_collections').delete().eq('id', id)
      if (error) throw new Error(error.message)
      if (hasCfWorker()) { const token = await getToken(); cfDeleteFeaturedCollection(id, token).catch(() => {}) }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] })
      qc.invalidateQueries({ queryKey: ['featured-collections'] })
      toast.success('Card deleted')
    },
    onError: (e: any) => toast.error(e.message),
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('featured_collections').update({ is_active: !is_active }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] })
      qc.invalidateQueries({ queryKey: ['featured-collections'] })
    },
  })

  const reorder = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: 'up' | 'down' }) => {
      const list = items as any[]
      const idx = list.findIndex(i => i.id === id)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= list.length) return
      const [a, b] = [list[idx], list[swapIdx]]
      await supabase.from('featured_collections').update({ display_order: b.display_order }).eq('id', a.id)
      await supabase.from('featured_collections').update({ display_order: a.display_order }).eq('id', b.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-collections'] }),
    onError: (e: any) => toast.error(e.message),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Collection Cards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            4 cards shown below the hero slider — add your product photos or short videos here
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          + Add Card
        </button>
      </div>

      {/* DB missing warning */}
      {dbMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Database table not set up yet</p>
            <p className="text-xs">Run this SQL in your Supabase Dashboard → SQL Editor to enable saving:</p>
            <pre className="mt-2 bg-amber-100 rounded p-2 text-[10px] overflow-x-auto whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS featured_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT,
  title TEXT NOT NULL,
  price TEXT,
  url TEXT,
  image_url TEXT,
  video_url TEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read collections" ON featured_collections FOR SELECT USING (is_active = true);
CREATE POLICY "Auth can manage collections" ON featured_collections FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');`}</pre>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <strong>How it works:</strong> Each card shows below the hero slider. Upload your own product photo or a short video (MP4/GIF). The card links to the URL you set — a category page, product page, or /customize.
      </div>

      {/* Cards list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {(items as any[]).map((item: any, idx: number) => (
            <div key={item.id ?? item.label} className={`bg-white rounded-xl border overflow-hidden flex gap-0 transition-opacity ${!item.is_active ? 'opacity-50' : 'border-border'}`}>
              {/* Order controls */}
              {!dbMissing && item.id && (
                <div className="flex flex-col items-center justify-center gap-1 px-3 border-r border-border bg-background/50">
                  <button onClick={() => reorder.mutate({ id: item.id, dir: 'up' })} disabled={idx === 0} className="p-1 hover:bg-muted rounded-lg disabled:opacity-20">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                  <button onClick={() => reorder.mutate({ id: item.id, dir: 'down' })} disabled={idx === (items as any[]).length - 1} className="p-1 hover:bg-muted rounded-lg disabled:opacity-20">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail */}
              {item.video_url ? (
                <video src={item.video_url} muted playsInline className="w-28 sm:w-36 h-24 object-cover flex-shrink-0 bg-black" />
              ) : item.image_url ? (
                <img src={item.image_url} alt="" className="w-28 sm:w-36 h-24 object-cover flex-shrink-0" />
              ) : (
                <div className="w-28 sm:w-36 h-24 bg-muted flex items-center justify-center text-muted-foreground text-xs flex-shrink-0 flex-col gap-1">
                  <span className="text-lg">🖼️</span>
                  <span>No image yet</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 p-3">
                <div className="flex items-center gap-2 mb-0.5">
                  {item.label && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{item.label}</span>}
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                {item.price && <p className="text-xs text-muted-foreground">{item.price}</p>}
                {item.url && <p className="text-[10px] text-primary mt-0.5 truncate">→ {item.url}</p>}
                {item.video_url && <p className="text-[10px] text-blue-600 mt-0.5">📹 Has video</p>}
              </div>

              {/* Actions */}
              {!dbMissing && item.id && (
                <div className="flex flex-col items-end justify-between p-3 gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive.mutate({ id: item.id, is_active: item.is_active })}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${item.is_active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700'}`}
                  >
                    {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <div className="flex gap-1.5">
                    <button onClick={() => openForm(item)} className="p-1.5 hover:bg-background rounded-lg" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.confirm(`Delete "${item.title}"?`) && del.mutate(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {dbMissing && (
                <div className="p-3 flex items-center">
                  <button onClick={() => openForm(item)} className="p-1.5 hover:bg-background rounded-lg" title="Edit">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Card' : 'New Card'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">

              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
                bucket="media" folder="collections"
                label="Card Image * (your product photo)"
                aspect="wide"
              />

              <VideoUpload
                value={form.video_url}
                onChange={url => setForm(f => ({ ...f, video_url: url }))}
                bucket="media" folder="collections-video"
                label="Card Video (optional — plays instead of image)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Label (e.g. Bridal)</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Bridal" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Bridal Bangle Set" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Price Text</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="From ₹2,499" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Link URL</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="/category/bridal" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Order (#1 = first)</label>
                  <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} type="number" min="1" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                  Show on homepage
                </label>
              </div>

              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                  : editing ? 'Update Card' : 'Add Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
