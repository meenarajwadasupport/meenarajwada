import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Loader2, FolderOpen, ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'

export default function AdminCategories() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', display_order: '1', is_active: true })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => { const { data } = await supabase.from('categories').select('*').order('display_order'); return data ?? [] },
  })

  function openForm(cat?: any) {
    if (cat) { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url ?? '', display_order: cat.display_order, is_active: cat.is_active }) }
    else {
      setEditing(null)
      const maxOrder = (categories as any[]).reduce((m: number, c: any) => Math.max(m, Number(c.display_order) || 0), 0)
      setForm({ name: '', slug: '', image_url: '', display_order: String(maxOrder + 1), is_active: true })
    }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const p = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), image_url: form.image_url, display_order: Number(form.display_order), is_active: form.is_active }
      if (editing) await supabase.from('categories').update(p).eq('id', editing.id)
      else await supabase.from('categories').insert(p)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Saved'); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('categories').delete().eq('id', id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Deleted') },
  })

  const reorder = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: 'up' | 'down' }) => {
      const list = categories as any[]
      const idx = list.findIndex(c => c.id === id)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= list.length) return
      const [a, b] = [list[idx], list[swapIdx]]
      await supabase.from('categories').update({ display_order: b.display_order }).eq('id', a.id)
      await supabase.from('categories').update({ display_order: a.display_order }).eq('id', b.id)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }) },
    onError: (e: any) => toast.error(e.message ?? 'Could not reorder'),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white transition-colors'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(categories as any[]).length} categor{(categories as any[]).length === 1 ? 'y' : 'ies'} · shown in this order on the shop page
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading categories…</p>
        </div>
      ) : (categories as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No categories yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Categories help customers browse your collections — Necklaces, Earrings, Bangles and more. Create your first one to get started.
          </p>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm mt-5">
            <Plus className="w-4 h-4" /> Add your first category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-border bg-background">
                <tr>
                  {['Order', 'Category', 'Slug', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(categories as any[]).map((c: any, idx: number) => (
                  <tr key={c.id} className={`transition-colors hover:bg-background/60 ${!c.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col">
                          <button
                            onClick={() => reorder.mutate({ id: c.id, dir: 'up' })}
                            disabled={idx === 0 || reorder.isPending}
                            className="p-0.5 rounded hover:bg-primary/10 hover:text-primary disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reorder.mutate({ id: c.id, dir: 'down' })}
                            disabled={idx === (categories as any[]).length - 1 || reorder.isPending}
                            className="p-0.5 rounded hover:bg-primary/10 hover:text-primary disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="w-11 h-11 object-cover rounded-lg border border-border flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                            <ImageOff className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">/{c.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {c.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openForm(c)} className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.confirm(`Delete category "${c.name}"? This cannot be undone.`) && del.mutate(c.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 bg-black/60 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif font-semibold text-lg">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} bucket="media" folder="categories" label="Category Image" aspect="square" />

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Necklaces" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated from name" className={inputCls} />
                <p className="text-[10px] text-muted-foreground mt-1">Used in the URL — leave blank to generate automatically.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Display Order</label>
                  <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} type="number" min="1" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                  Active (visible on site)
                </label>
              </div>

              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                  : editing ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
