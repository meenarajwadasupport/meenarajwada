import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Trash2, Download, Loader2, MailPlus, Users } from 'lucide-react'
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-foreground">Newsletter</h1>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {(subs as any[]).length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(subs as any[]).length} subscriber{(subs as any[]).length === 1 ? '' : 's'} · export the list to send campaigns
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!(subs as any[]).length}
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subscribers…</p>
        </div>
      ) : (subs as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MailPlus className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No subscribers yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When visitors sign up for your newsletter on the website, their email addresses will appear here — ready to export for your next campaign.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="border-b border-border bg-background">
                <tr>
                  {['#', 'Email', 'Subscribed On', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(subs as any[]).map((s: any, idx: number) => (
                  <tr key={s.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground w-10">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(s.email ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => window.confirm(`Remove "${s.email}" from the newsletter?`) && del.mutate(s.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
