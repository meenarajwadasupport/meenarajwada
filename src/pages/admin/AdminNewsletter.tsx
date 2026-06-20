import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminNewsletter() {
  const qc = useQueryClient()
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: async () => { const { data } = await supabase.from('newsletter_subs').select('*').order('created_at', { ascending: false }); return data ?? [] },
  })

  const del = useMutation({
    mutationFn: async (id: string) => supabase.from('newsletter_subs').delete().eq('id', id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-newsletter'] }); toast.success('Removed') },
  })

  function exportCSV() {
    const csv = ['email,subscribed_at', ...subs.map((s: any) => `${s.email},${s.created_at}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter_subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-serif text-2xl font-bold">Newsletter</h1><p className="text-muted-foreground text-sm mt-0.5">{subs.length} subscribers</p></div>
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2 px-4 py-2 text-sm"><Download className="w-4 h-4" /> Export CSV</button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background"><tr>{['Email', 'Subscribed', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {subs.map((s: any) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><button onClick={() => del.mutate(s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!subs.length && <p className="text-center text-muted-foreground py-8">No subscribers yet.</p>}
        </div>
      )}
    </div>
  )
}
