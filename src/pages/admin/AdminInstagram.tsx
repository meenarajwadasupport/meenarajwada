import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Instagram, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const BLANK = { reel_id: '', caption: '', display_order: '1', is_active: true }

export default function AdminInstagram() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(BLANK)

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
      setForm({ reel_id: post.reel_id, caption: post.caption ?? '', display_order: post.display_order, is_active: post.is_active })
    } else {
      setEditing(null)
      setForm({ ...BLANK, display_order: String((posts.length ?? 0) + 1) })
    }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const id = form.reel_id.trim().replace(/.*\/reel\//i, '').replace(/\//g, '')
      if (!id) throw new Error('Reel ID is required')
      const payload = { reel_id: id, caption: form.caption.trim(), display_order: Number(form.display_order), is_active: form.is_active }
      if (editing) await supabase.from('instagram_posts').update(payload).eq('id', editing.id)
      else await supabase.from('instagram_posts').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-instagram'] }); toast.success('Saved'); setShowForm(false) },
    onError: (e: any) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('instagram_posts').delete().eq('id', id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-instagram'] }); toast.success('Deleted') },
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('instagram_posts').update({ is_active: !is_active }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instagram'] }),
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Instagram className="w-6 h-6 text-pink-500" /> Instagram Feed
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-muted-foreground">{(posts as any[]).filter((p: any) => p.is_active).length} active reels shown on homepage</p>
            <a href="https://www.instagram.com/meena.rajwada/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold">
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
        <p className="font-semibold mb-1">How to get a Reel ID</p>
        <p>Open the reel on Instagram → tap Share → Copy Link.</p>
        <p className="font-mono bg-pink-100 rounded px-2 py-1 mt-1 text-xs inline-block">instagram.com/reel/<strong>C-C3abzBKYd</strong>/ → ID: C-C3abzBKYd</p>
        <p className="mt-1 text-xs">You can paste the full URL — the ID will be extracted automatically.</p>
      </div>

      {/* Posts list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {(posts as any[]).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Instagram className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No reels yet</p>
            <p className="text-xs">Add your first Instagram reel to display it on the homepage.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr>
                {['Order', 'Reel ID', 'Caption', 'Preview', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(posts as any[]).map((post, idx) => (
                <tr key={post.id} className={`hover:bg-background/40 transition-colors ${!post.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => reorder.mutate({ id: post.id, dir: 'up' })} disabled={idx === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-20">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-center text-xs font-bold text-muted-foreground">{idx + 1}</span>
                      <button onClick={() => reorder.mutate({ id: post.id, dir: 'down' })} disabled={idx === posts.length - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-20">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-sm">{post.reel_id}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{post.caption || '—'}</td>
                  <td className="px-4 py-3">
                    <a href={`https://www.instagram.com/meena.rajwada/reel/${post.reel_id}/`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-xs">
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle.mutate({ id: post.id, is_active: post.is_active })}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${post.is_active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-600'}`}>
                      {post.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openForm(post)} className="p-1.5 hover:bg-background rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del.mutate(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Reel' : 'Add Instagram Reel'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Reel ID or URL *</label>
                <input
                  value={form.reel_id}
                  onChange={e => setForm(f => ({ ...f, reel_id: e.target.value }))}
                  placeholder="C-C3abzBKYd  or  instagram.com/reel/C-C3abzBKYd/"
                  className={inputCls}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Paste the full URL — the ID will be extracted automatically</p>
              </div>
              <input
                value={form.caption}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Caption (optional)"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3 items-center">
                <input
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                  placeholder="Display Order"
                  type="number"
                  min="1"
                  className={inputCls}
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                  Show on homepage
                </label>
              </div>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="btn-primary w-full py-2.5 disabled:opacity-60"
              >
                {save.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
