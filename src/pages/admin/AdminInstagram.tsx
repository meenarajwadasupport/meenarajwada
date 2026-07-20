import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Instagram, ExternalLink, Loader2, Image } from 'lucide-react'
import { toast } from 'sonner'

const BLANK = { reel_id: '', caption: '', display_order: '1', is_active: true }

export default function AdminInstagram() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(BLANK)
  const [fetchingThumb, setFetchingThumb] = useState(false)

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-instagram'],
    queryFn: async () => {
      const { data } = await supabase.from('instagram_posts').select('*').order('display_order')
      return data ?? []
    },
  })

  function openForm(post?: any) {
    if (post) {
      setEditing(post)
      setForm({
        reel_id: post.reel_id,
        caption: post.caption ?? '',
        thumbnail_url: post.thumbnail_url ?? '',
        display_order: post.display_order,
        is_active: post.is_active,
      })
    } else {
      setEditing(null)
      setForm({ ...BLANK, display_order: String((posts.length ?? 0) + 1) })
    }
    setShowForm(true)
  }

  // Auto-fetch thumbnail from Instagram when reel ID is entered
  async function fetchThumbnail(rawId: string) {
    const id = rawId.trim().replace(/.*\/reel\//i, '').replace(/\//g, '')
    if (!id) return
    setFetchingThumb(true)
    try {
      const resp = await fetch(`/api/ig-thumb?id=${encodeURIComponent(id)}`)
      const data = await resp.json()
      if (data.thumbnail) {
        setForm((f: any) => ({ ...f, thumbnail_url: data.thumbnail }))
        toast.success('Thumbnail fetched!')
      } else {
        toast.error('Could not fetch thumbnail automatically — post may be private')
      }
    } catch {
      toast.error('Thumbnail fetch failed')
    } finally {
      setFetchingThumb(false)
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const id = form.reel_id.trim().replace(/.*\/reel\//i, '').replace(/\//g, '')
      if (!id) throw new Error('Reel ID or URL is required')

      // Auto-fetch thumbnail if not already set
      let thumbnail_url = form.thumbnail_url?.trim() || null
      if (!thumbnail_url) {
        try {
          const resp = await fetch(`/api/ig-thumb?id=${encodeURIComponent(id)}`)
          const data = await resp.json()
          if (data.thumbnail) thumbnail_url = data.thumbnail
        } catch {
          // proceed without thumbnail
        }
      }

      const payload = {
        reel_id: id,
        caption: form.caption.trim(),
        thumbnail_url: thumbnail_url || null,
        display_order: Number(form.display_order),
        is_active: form.is_active,
      }
      if (editing) {
        const { error } = await supabase.from('instagram_posts').update(payload).eq('id', editing.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase.from('instagram_posts').insert(payload)
        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-instagram'] })
      qc.invalidateQueries({ queryKey: ['instagram-posts-public'] })
      toast.success('Saved — homepage updated!')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('instagram_posts').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-instagram'] })
      qc.invalidateQueries({ queryKey: ['instagram-posts-public'] })
      toast.success('Deleted')
    },
    onError: (e: any) => toast.error(e.message),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('instagram_posts').update({ is_active: !is_active }).eq('id', id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-instagram'] })
      qc.invalidateQueries({ queryKey: ['instagram-posts-public'] })
    },
  })

  const reorder = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: 'up' | 'down' }) => {
      const list = posts as any[]
      const idx = list.findIndex(p => p.id === id)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= list.length) return
      await supabase.from('instagram_posts').update({ display_order: list[swapIdx].display_order }).eq('id', list[idx].id)
      await supabase.from('instagram_posts').update({ display_order: list[idx].display_order }).eq('id', list[swapIdx].id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instagram'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Instagram className="w-6 h-6 text-pink-500" /> Instagram Feed
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-muted-foreground">
              {(posts as any[]).filter((p: any) => p.is_active).length} active reels shown on homepage
            </p>
            <a
              href="https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" /> @meena.rajwada
            </a>
          </div>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Reel
        </button>
      </div>

      {/* How-to tip */}
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6 text-sm text-pink-800">
        <p className="font-semibold mb-1">How to add a Reel</p>
        <p>Open any reel on Instagram → tap <strong>Share</strong> → <strong>Copy Link</strong> → paste it here.</p>
        <p className="font-mono bg-pink-100 rounded px-2 py-1 mt-1.5 text-xs inline-block">
          instagram.com/reel/<strong>DPngJf0Af1H</strong>/
        </p>
        <p className="mt-1 text-xs">The thumbnail is fetched <strong>automatically</strong> — no extra steps needed.</p>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {(posts as any[]).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Instagram className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No reels yet</p>
            <p className="text-xs mt-1">Add your first Instagram reel to show it on the homepage.</p>
            <button onClick={() => openForm()} className="btn-primary mt-4 px-4 py-2 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Reel
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-border bg-background/50">
                <tr>
                  {['#', 'Thumbnail', 'Reel ID', 'Caption', 'Link', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(posts as any[]).map((post, idx) => (
                  <tr key={post.id} className={`hover:bg-background/40 transition-colors ${!post.is_active ? 'opacity-50' : ''}`}>
                    {/* Order */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => reorder.mutate({ id: post.id, dir: 'up' })} disabled={idx === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-20">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                        <button onClick={() => reorder.mutate({ id: post.id, dir: 'down' })} disabled={idx === (posts as any[]).length - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-20">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {/* Thumbnail */}
                    <td className="px-3 py-2">
                      <a href={`https://www.instagram.com/reel/${post.reel_id}/`} target="_blank" rel="noopener noreferrer">
                        {post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url}
                            alt="thumbnail"
                            className="w-14 h-14 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`${post.thumbnail_url ? 'hidden' : ''} w-14 h-14 rounded-lg flex items-center justify-center`}
                          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}>
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                      </a>
                    </td>
                    {/* Reel ID */}
                    <td className="px-4 py-3 font-mono text-xs font-bold text-foreground/80">{post.reel_id}</td>
                    {/* Caption */}
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate text-xs">{post.caption || '—'}</td>
                    {/* Link */}
                    <td className="px-4 py-3">
                      <a
                        href={`https://www.instagram.com/reel/${post.reel_id}/`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-xs font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle.mutate({ id: post.id, is_active: post.is_active })}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${post.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                          : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-600'}`}
                      >
                        {post.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openForm(post)} className="p-1.5 hover:bg-background rounded-lg text-foreground/60 hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('Delete this reel?')) del.mutate(post.id) }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif font-semibold text-lg">{editing ? 'Edit Reel' : 'Add Instagram Reel'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Reel URL / ID */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Instagram Reel URL or ID *
                </label>
                <input
                  value={form.reel_id}
                  onChange={e => setForm((f: any) => ({ ...f, reel_id: e.target.value, thumbnail_url: '' }))}
                  placeholder="instagram.com/reel/DPngJf0Af1H/"
                  className={inputCls}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Paste the full Instagram reel link — thumbnail is fetched automatically on Save.
                </p>
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Caption <span className="font-normal normal-case">(optional)</span></label>
                <input
                  value={form.caption}
                  onChange={e => setForm((f: any) => ({ ...f, caption: e.target.value }))}
                  placeholder="e.g. Gold Silk Thread Bangles ✨"
                  className={inputCls}
                />
              </div>

              {/* Thumbnail preview + fetch button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Thumbnail</label>
                  <button
                    type="button"
                    onClick={() => fetchThumbnail(form.reel_id)}
                    disabled={fetchingThumb || !form.reel_id.trim()}
                    className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-semibold disabled:opacity-40"
                  >
                    {fetchingThumb ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
                    {fetchingThumb ? 'Fetching…' : 'Fetch from Instagram'}
                  </button>
                </div>
                {form.thumbnail_url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                    <img
                      src={form.thumbnail_url}
                      alt="thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.src = '')}
                    />
                    <button
                      onClick={() => setForm((f: any) => ({ ...f, thumbnail_url: '' }))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1 border border-dashed border-pink-300 text-pink-400"
                    style={{ background: 'linear-gradient(135deg,#f9e2f2,#fce4e4)' }}
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-wide text-center">Auto on Save</span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Thumbnail is fetched automatically when you save. Click "Fetch from Instagram" to preview it first.
                </p>
              </div>

              {/* Order + Active */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Display Order</label>
                  <input
                    value={form.display_order}
                    onChange={e => setForm((f: any) => ({ ...f, display_order: e.target.value }))}
                    type="number"
                    min="1"
                    className={inputCls}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))}
                    className="accent-primary w-4 h-4"
                  />
                  Show on homepage
                </label>
              </div>

              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {save.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving & fetching thumbnail…</> : 'Save Reel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
