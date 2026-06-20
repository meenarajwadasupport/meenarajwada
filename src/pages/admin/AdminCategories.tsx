import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCategories() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', display_order: '1', is_active: true })

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => { const { data } = await supabase.from('categories').select('*').order('display_order'); return data ?? [] },
  })

  function openForm(cat?: any) {
    if (cat) { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url ?? '', display_order: cat.display_order, is_active: cat.is_active }) }
    else { setEditing(null); setForm({ name: '', slug: '', image_url: '', display_order: '1', is_active: true }) }
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

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Categories</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background"><tr>{['Category', 'Slug', 'Order', 'Active', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {categories.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 flex items-center gap-3">{c.image_url && <img src={c.image_url} alt="" className="w-8 h-8 object-cover rounded-lg" />}{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3">{c.display_order}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.is_active ? 'Active' : 'Off'}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openForm(c)}><Pencil className="w-4 h-4" /></button><button onClick={() => del.mutate(c.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4"><h2 className="font-semibold">{editing ? 'Edit' : 'New'} Category</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Category Name" className={inputCls} />
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Slug (auto)" className={inputCls} />
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className={inputCls} />
              <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="Display Order" type="number" className={inputCls} />
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary" />Active</label>
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-2.5 disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
