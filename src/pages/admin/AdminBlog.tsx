import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Loader2, FileText, ImageOff, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

export default function AdminBlog() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', is_published: false })

  const { data: posts = [], isLoading } = useQuery({
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

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white transition-colors'
  const publishedCount = (posts as any[]).filter((p: any) => p.is_published).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {publishedCount} published · {(posts as any[]).length - publishedCount} draft{(posts as any[]).length - publishedCount === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading posts…</p>
        </div>
      ) : (posts as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No blog posts yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Share the story behind your jewellery — care tips, styling ideas, festival collections. Blog posts also help customers find you on Google.
          </p>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm mt-5">
            <Plus className="w-4 h-4" /> Write your first post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {(posts as any[]).map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-border overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              {p.cover_image ? (
                <img src={p.cover_image} alt={p.title} className="w-24 sm:w-36 h-auto object-cover flex-shrink-0" />
              ) : (
                <div className="w-24 sm:w-36 bg-background border-r border-border flex items-center justify-center flex-shrink-0">
                  <ImageOff className="w-5 h-5 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 p-4">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-semibold text-sm sm:text-base truncate flex-1 min-w-0">{p.title}</p>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.is_published ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {p.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <code className="bg-background px-2 py-0.5 rounded-md border border-border">/blog/{p.slug}</code>
                  {p.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-1.5 p-3 border-l border-border bg-background/40 flex-shrink-0">
                <button onClick={() => openForm(p)} className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.confirm(`Delete post "${p.title}"? This cannot be undone.`) && del.mutate(p.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 bg-black/60 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif font-semibold text-lg">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUpload value={form.cover_image} onChange={url => setForm(f => ({ ...f, cover_image: url }))} bucket="media" folder="blog" label="Cover Image" aspect="wide" />

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How to Care for Meenakari Jewellery" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated from title" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown in the blog list" rows={2} className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write the full post here…" rows={10} className={`${inputCls} resize-y`} />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="accent-primary w-4 h-4" />
                Published (visible on website)
              </label>

              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                  : editing ? 'Update Post' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
