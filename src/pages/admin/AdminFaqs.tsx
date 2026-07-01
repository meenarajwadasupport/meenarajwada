import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const BLANK = { question: '', answer: '', display_order: '1', is_active: true }

export default function AdminFaqs() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(BLANK)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: faqs = [] } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await supabase.from('faqs').select('*').order('display_order')
      return data ?? []
    },
  })

  function openForm(faq?: any) {
    if (faq) {
      setEditing(faq)
      setForm({ question: faq.question, answer: faq.answer, display_order: faq.display_order, is_active: faq.is_active })
    } else {
      setEditing(null)
      setForm({ ...BLANK, display_order: String((faqs.length ?? 0) + 1) })
    }
    setShowForm(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.question.trim()) throw new Error('Question is required')
      if (!form.answer.trim()) throw new Error('Answer is required')
      const payload = { question: form.question.trim(), answer: form.answer.trim(), display_order: Number(form.display_order), is_active: form.is_active }
      if (editing) await supabase.from('faqs').update(payload).eq('id', editing.id)
      else await supabase.from('faqs').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('Saved'); setShowForm(false) },
    onError: (e: any) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('faqs').delete().eq('id', id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('Deleted') },
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('faqs').update({ is_active: !is_active }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">FAQs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{faqs.length} questions</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* FAQ list */}
      <div className="space-y-2">
        {(faqs as any[]).map((faq) => (
          <div key={faq.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${faq.is_active ? 'border-border' : 'border-border/40 opacity-60'}`}>
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                {expanded === faq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                <span className="font-medium text-sm">{faq.question}</span>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {faq.is_active ? 'Active' : 'Hidden'}
                </span>
                <button onClick={() => toggle.mutate({ id: faq.id, is_active: faq.is_active })}
                  className="p-1.5 hover:bg-background rounded text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {faq.is_active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => openForm(faq)} className="p-1.5 hover:bg-background rounded"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => del.mutate(faq.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {expanded === faq.id && (
              <div className="px-4 pb-4 pt-0 ml-7 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                <div className="pt-3 whitespace-pre-wrap">{faq.answer}</div>
              </div>
            )}
          </div>
        ))}
        {!faqs.length && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No FAQs yet. Add your first FAQ!</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg">{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder="Question *"
                className={inputCls}
              />
              <textarea
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                placeholder="Answer *"
                rows={5}
                className={`${inputCls} resize-none`}
              />
              <div className="grid grid-cols-2 gap-3">
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
                  Active (visible)
                </label>
              </div>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="btn-primary w-full py-2.5 disabled:opacity-60"
              >
                {save.isPending ? 'Saving…' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
