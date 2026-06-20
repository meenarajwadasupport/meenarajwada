import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminBlog() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', is_published: false })

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => { const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); return data ?? [] },
  })

  function openForm(p?: any) {
    if (p) { setEditing(p); setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', content: p.content ?? '', cover_image: p.cover_image ?? '', is_published: p.is_published }) }
    else { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', is_published: false }) }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = { title: form.title, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), excerpt: form.excerpt, content: form.content, cover_image: form.cover_image, is_published: form.is_published }
      if (editing) await supabase.from('blog_posts').update(payload).eq('id', editing.id)
      else await supabase.from('blog_posts').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); toast.success('Saved'); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: async (id: string) => supabase.from('blog_posts').delete().eq('id', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4" /> New Post</button>
      </div>
      <div className="space-y-3">
        {posts.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.slug}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.is_published ? 'Published' : 'Draft'}</span>
            <div className="flex gap-2">
              <button onClick={() => openForm(p)}><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del.mutate(p.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {!posts.length && <p className="text-muted-foreground">No posts yet.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-4">
            <div className="flex justify-between mb-4"><h2 className="font-semibold">{editing ? 'Edit' : 'New'} Post</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post Title" className={inputCls} />
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Slug (auto)" className={inputCls} />
              <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="Cover Image URL" className={inputCls} />
              <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short excerpt" rows={2} className={`${inputCls} resize-none`} />
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Full content" rows={10} className={`${inputCls} resize-none`} />
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="accent-primary" />Published</label>
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
