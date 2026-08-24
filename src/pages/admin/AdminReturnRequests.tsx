import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import { RotateCcw, Search, ChevronDown, ChevronUp, Check } from 'lucide-react'

const STATUSES = ['pending', 'approved', 'rejected', 'completed']

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved:  'bg-blue-100 text-blue-700 border-blue-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

const REASON_LABELS: Record<string, string> = {
  damaged:        'Damaged / Defective',
  wrong_item:     'Wrong Item Received',
  size_issue:     'Size / Fit Issue',
  not_as_described: 'Not as Described',
  changed_mind:   'Changed Mind',
  other:          'Other',
}

export default function AdminReturnRequests() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-return-requests', filterStatus],
    queryFn: async () => {
      let q = supabase.from('return_requests').select('*').order('created_at', { ascending: false })
      if (filterStatus !== 'all') q = q.eq('status', filterStatus)
      const { data } = await q
      return data ?? []
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const patch: any = {}
      if (status) patch.status = status
      if (admin_notes !== undefined) patch.admin_notes = admin_notes
      const { error } = await supabase.from('return_requests').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-return-requests'] }); toast.success('Updated') },
    onError: () => toast.error('Could not update'),
  })

  const filtered = requests.filter((r: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.customer_name?.toLowerCase().includes(q) ||
      r.customer_email?.toLowerCase().includes(q) ||
      r.order_number?.toLowerCase().includes(q)
    )
  })

  const pendingCount = requests.filter((r: any) => r.status === 'pending').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Return Requests</h1>
          {pendingCount > 0 && <p className="text-sm text-amber-600 font-medium mt-0.5">{pendingCount} pending review</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, order number…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-[11px] font-semibold capitalize border transition-colors ${
                filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <RotateCcw className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No return requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => {
            const isOpen = expanded === r.id
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_COLOR[r.status] ?? 'bg-muted text-foreground border-border'}`}>
                      {r.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground truncate">Order: {r.order_number} · {REASON_LABELS[r.reason] ?? r.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer</p>
                        <p className="text-sm font-semibold">{r.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{r.customer_email}</p>
                        {r.customer_phone && <p className="text-sm text-muted-foreground">{r.customer_phone}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Request Details</p>
                        <p className="text-sm"><span className="font-medium">Order:</span> {r.order_number}</p>
                        <p className="text-sm"><span className="font-medium">Reason:</span> {REASON_LABELS[r.reason] ?? r.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {r.description && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer's Description</p>
                        <p className="text-sm text-foreground/80 bg-muted/40 rounded-xl px-4 py-3">{r.description}</p>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Admin Notes</p>
                      <div className="flex gap-2">
                        <input
                          value={noteInputs[r.id] ?? r.admin_notes ?? ''}
                          onChange={e => setNoteInputs(n => ({ ...n, [r.id]: e.target.value }))}
                          placeholder="Add internal notes…"
                          className="flex-1 border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-primary bg-white"
                        />
                        <button
                          onClick={() => update.mutate({ id: r.id, admin_notes: noteInputs[r.id] ?? '' })}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUSES.filter(s => s !== r.status).map(s => (
                          <button
                            key={s}
                            onClick={() => update.mutate({ id: r.id, status: s })}
                            className={`px-4 py-2 rounded-xl text-[11px] font-semibold capitalize border transition-colors ${STATUS_COLOR[s] ?? 'bg-muted text-foreground border-border'} hover:opacity-80`}
                          >
                            Mark {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
