import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown, ChevronRight, Eye, EyeOff, Info } from 'lucide-react'
import { hasCfWorker, cfCreateNavCollection, cfUpdateNavCollection, cfDeleteNavCollection } from '@/lib/cfApi'

const SQL = `-- Run this once in Supabase → SQL Editor
CREATE TABLE IF NOT EXISTS nav_collections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label        TEXT NOT NULL,
  href         TEXT NOT NULL DEFAULT '/',
  parent_id    UUID REFERENCES nav_collections(id) ON DELETE CASCADE,
  display_order INT  DEFAULT 1,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE nav_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nav_collections"  ON nav_collections FOR SELECT USING (true);
CREATE POLICY "Auth manage nav_collections"  ON nav_collections FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Seed default data
INSERT INTO nav_collections (label, href, parent_id, display_order, is_active) VALUES
  ('Bangles',          '/category/bangles',         NULL, 1, true),
  ('Custom Jewelry',   '/category/custom-jewelry',  NULL, 2, true),
  ('Bridal',           '/category/bridal',           NULL, 3, true),
  ('Festive',          '/category/festive',           NULL, 4, true),
  ('Rajwada Heritage', '/category/rajwada-heritage', NULL, 5, true);

-- Add sub-collections under Bangles
INSERT INTO nav_collections (label, href, parent_id, display_order, is_active)
SELECT 'Traditional Bangles', '/category/bangles/traditional', id, 1, true
FROM nav_collections WHERE label = 'Bangles' LIMIT 1;

INSERT INTO nav_collections (label, href, parent_id, display_order, is_active)
SELECT 'Modern Bangles', '/category/bangles/modern', id, 2, true
FROM nav_collections WHERE label = 'Bangles' LIMIT 1;`

const BLANK = { label: '', href: '/', parent_id: '', display_order: '1', is_active: true }

export default function AdminNavMenu() {
  const qc = useQueryClient()
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState<typeof BLANK>(BLANK)
  const [expanded, setExpanded]     = useState<Set<string>>(new Set())
  const [dbMissing, setDbMissing]   = useState(false)

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['admin-nav-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_collections')
        .select('*')
        .order('display_order')
      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          setDbMissing(true); return []
        }
        throw error
      }
      setDbMissing(false)
      return data ?? []
    },
  })

  // Build tree: top-level + children map
  const topLevel  = allItems.filter((i: any) => !i.parent_id)
  const childrenOf = (pid: string) => allItems.filter((i: any) => i.parent_id === pid)

  function openAdd(parentId?: string) {
    setEditing(null)
    const siblings = parentId ? childrenOf(parentId) : topLevel
    const maxOrder = siblings.reduce((m: number, i: any) => Math.max(m, i.display_order ?? 0), 0)
    setForm({ ...BLANK, parent_id: parentId ?? '', display_order: String(maxOrder + 1) })
    setShowForm(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    setForm({
      label:         item.label ?? '',
      href:          item.href  ?? '/',
      parent_id:     item.parent_id ?? '',
      display_order: String(item.display_order ?? 1),
      is_active:     item.is_active ?? true,
    })
    setShowForm(true)
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? ''
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.label.trim()) throw new Error('Label is required')
      if (!form.href.trim())  throw new Error('URL is required')
      const payload = {
        label:         form.label.trim(),
        href:          form.href.trim(),
        parent_id:     form.parent_id || null,
        display_order: Number(form.display_order) || 1,
        is_active:     form.is_active,
      }
      if (editing?.id) {
        const { error } = await supabase.from('nav_collections').update(payload).eq('id', editing.id)
        if (error) throw new Error(error.message)
        if (hasCfWorker()) { const token = await getToken(); cfUpdateNavCollection(editing.id, payload, token).catch(() => {}) }
      } else {
        const { data, error } = await supabase.from('nav_collections').insert(payload).select().single()
        if (error) throw new Error(error.message)
        if (hasCfWorker() && data) { const token = await getToken(); cfCreateNavCollection({ ...payload, id: data.id }, token).catch(() => {}) }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-nav-collections'] })
      qc.invalidateQueries({ queryKey: ['nav-collections'] })
      toast.success(editing ? 'Updated ✓' : 'Added ✓')
      setShowForm(false)
    },
    onError: (e: any) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nav_collections').delete().eq('id', id)
      if (error) throw new Error(error.message)
      if (hasCfWorker()) { const token = await getToken(); cfDeleteNavCollection(id, token).catch(() => {}) }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-nav-collections'] })
      qc.invalidateQueries({ queryKey: ['nav-collections'] })
      toast.success('Deleted')
    },
    onError: (e: any) => toast.error(e.message),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('nav_collections').update({ is_active: !is_active }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-nav-collections'] })
      qc.invalidateQueries({ queryKey: ['nav-collections'] })
    },
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  const CollectionRow = ({ item, isChild = false }: { item: any; isChild?: boolean }) => {
    const kids = childrenOf(item.id)
    const isExpanded = expanded.has(item.id)
    return (
      <div>
        <div className={`flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5 ${isChild ? 'ml-8 border-dashed' : ''} ${!item.is_active ? 'opacity-50' : ''}`}>
          {/* Expand toggle (for parents with children) */}
          {!isChild && (
            <button
              onClick={() => setExpanded(prev => {
                const s = new Set(prev)
                s.has(item.id) ? s.delete(item.id) : s.add(item.id)
                return s
              })}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              {kids.length > 0
                ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
                : <span className="w-4 h-4 block" />}
            </button>
          )}
          {isChild && <span className="w-3 h-px bg-border flex-shrink-0 ml-2" />}

          {/* Label + URL */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{item.label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item.href}</p>
          </div>

          {/* Sub-collections badge */}
          {kids.length > 0 && !isChild && (
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
              {kids.length} sub
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isChild && (
              <button
                onClick={() => openAdd(item.id)}
                title="Add sub-collection"
                className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary border border-border hover:border-primary px-2 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Sub
              </button>
            )}
            <button
              onClick={() => toggle.mutate({ id: item.id, is_active: item.is_active })}
              className={`p-1.5 rounded-lg transition-colors ${item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-background'}`}
              title={item.is_active ? 'Hide' : 'Show'}
            >
              {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.confirm(`Delete "${item.label}"${kids.length ? ` and its ${kids.length} sub-collection(s)` : ''}?`) && del.mutate(item.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors" title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && kids.length > 0 && (
          <div className="mt-1.5 space-y-1.5">
            {kids.map((child: any) => (
              <CollectionRow key={child.id} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Navigation Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the Collections dropdown in the website header — add sub-collections like Traditional, Modern, etc.
          </p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      </div>

      {/* DB missing */}
      {dbMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 w-full">
            <p className="font-semibold mb-2">Database table not set up yet — run this SQL first:</p>
            <pre className="bg-amber-100 rounded-lg p-3 text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed">{SQL}</pre>
          </div>
        </div>
      )}

      {/* Info banner */}
      {!dbMissing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          Click <strong>▶</strong> to expand a collection and see its sub-collections. Use <strong>+ Sub</strong> to add items like "Traditional" or "Modern" under Bangles.
        </div>
      )}

      {/* Collections list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : topLevel.length === 0 && !dbMissing ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No collections yet. Click "Add Collection" to start.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topLevel.map((item: any) => (
            <CollectionRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg">
                {editing ? 'Edit' : 'Add'} {form.parent_id ? 'Sub-collection' : 'Collection'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-background rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Label *</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Traditional Bangles" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">URL / Path *</label>
                <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                  placeholder="/category/bangles/traditional" className={inputCls} />
                <p className="text-[10px] text-muted-foreground mt-1">Use /category/name for collection pages</p>
              </div>

              {/* Parent selector — only when adding, not for sub-sub */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Parent Collection</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className={inputCls}>
                  <option value="">— None (top-level collection) —</option>
                  {topLevel.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Order</label>
                  <input value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                    type="number" min="1" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="accent-primary w-4 h-4" />
                  Visible in menu
                </label>
              </div>

              <button onClick={() => save.mutate()} disabled={save.isPending}
                className="btn-primary w-full py-3 disabled:opacity-60 font-semibold">
                {save.isPending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span>
                  : editing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
