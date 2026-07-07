import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Phone, Mail, IndianRupee, MessageSquare, Loader2, Sparkles, MessageCircle } from 'lucide-react'

const STATUSES = ['new', 'reviewing', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled']

const STATUS_COLOR: Record<string, string> = {
  new:         'bg-blue-100 text-blue-700',
  reviewing:   'bg-yellow-100 text-yellow-700',
  quoted:      'bg-purple-100 text-purple-700',
  confirmed:   'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
}

export default function AdminCustomOrders() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-custom-orders', filterStatus],
    queryFn: async () => {
      let q = supabase.from('custom_order_requests').select('*').order('created_at', { ascending: false })
      if (filterStatus !== 'all') q = q.eq('status', filterStatus)
      const { data } = await q
      return data ?? []
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, status, quoted_price, admin_notes }: { id: string; status?: string; quoted_price?: number; admin_notes?: string }) => {
      const payload: any = { updated_at: new Date().toISOString() }
      if (status)       payload.status       = status
      if (quoted_price) payload.quoted_price = quoted_price
      if (admin_notes !== undefined) payload.admin_notes = admin_notes
      const { error } = await supabase.from('custom_order_requests').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-custom-orders'] }); toast.success('Updated') },
    onError: () => toast.error('Could not update'),
  })

  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: orders.filter((o: any) => o.status === s).length
  }), {} as Record<string, number>)

  function whatsappLink(order: any) {
    const phone = String(order.customer_phone ?? '').replace(/[^0-9]/g, '')
    const withCountry = phone.length === 10 ? `91${phone}` : phone
    const text = encodeURIComponent(`Hello ${order.customer_name}, this is Meena Rajwada regarding your custom jewellery request. `)
    return `https://wa.me/${withCountry}?text=${text}`
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Custom Order Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {orders.length} request{orders.length === 1 ? '' : 's'}{filterStatus !== 'all' ? ` · filtered by "${filterStatus.replace('_', ' ')}"` : ''} · click a request to review and quote
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterStatus === 'all' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-colors ${filterStatus === s ? `${STATUS_COLOR[s]} border-current shadow-sm` : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
            {s.replace('_', ' ')} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading requests…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No custom requests {filterStatus !== 'all' ? `with status "${filterStatus.replace('_', ' ')}"` : 'yet'}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When customers request bespoke jewellery through the custom order page, their requests will appear here for you to review and quote.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-shadow ${expanded === order.id ? 'border-primary/40 shadow-md' : 'border-border hover:shadow-md'}`}>

              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold flex-shrink-0">
                    {(order.customer_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{order.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{order.description?.slice(0, 80)}…</p>
                  {order.occasion && <p className="text-[10px] text-muted-foreground">Occasion: {order.occasion}</p>}
                </div>

                {order.budget && (
                  <span className="text-xs font-semibold text-primary whitespace-nowrap">Budget: {order.budget}</span>
                )}

                {order.quoted_price && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                    <IndianRupee className="w-3 h-3" /> {order.quoted_price.toLocaleString('en-IN')}
                  </span>
                )}

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>

                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-border p-4 space-y-4 bg-background/30">
                  <div className="grid sm:grid-cols-2 gap-4">

                    {/* Customer Details */}
                    <div className="bg-white rounded-xl border border-border p-4 space-y-2 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</p>
                      <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_email}
                      </a>
                      <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_phone}
                      </a>
                      {order.customer_phone && (
                        <a
                          href={whatsappLink(order)}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 mt-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Request Details */}
                    <div className="bg-white rounded-xl border border-border p-4 space-y-1.5 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Request Details</p>
                      {order.design_type   && <p><span className="text-muted-foreground text-xs">Type:</span> {order.design_type}</p>}
                      {order.occasion      && <p><span className="text-muted-foreground text-xs">Occasion:</span> {order.occasion}</p>}
                      {order.color_prefs   && <p><span className="text-muted-foreground text-xs">Colors:</span> {order.color_prefs}</p>}
                      {order.size_prefs    && <p><span className="text-muted-foreground text-xs">Size:</span> {order.size_prefs}</p>}
                      {order.budget        && <p><span className="text-muted-foreground text-xs">Budget:</span> {order.budget}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-xl border border-border p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{order.description}</p>
                  </div>

                  {/* Reference Images */}
                  {order.reference_images?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Reference Images</p>
                      <div className="flex flex-wrap gap-2">
                        {order.reference_images.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border hover:opacity-80 hover:border-primary transition-all" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-border items-center">

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Status:</label>
                      <select value={order.status}
                        onChange={e => update.mutate({ id: order.id, status: e.target.value })}
                        disabled={update.isPending}
                        className="border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white capitalize disabled:opacity-60 transition-colors">
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>

                    {/* Quoted Price */}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        placeholder="Quote price ₹"
                        value={quotes[order.id] ?? order.quoted_price ?? ''}
                        onChange={e => setQuotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="w-32 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white transition-colors"
                      />
                      <button
                        onClick={() => quotes[order.id] && update.mutate({ id: order.id, quoted_price: Number(quotes[order.id]), status: 'quoted' })}
                        disabled={update.isPending}
                        className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
                      >
                        {update.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        Send Quote
                      </button>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      <MessageSquare className="w-3 h-3 inline mr-1" />Admin Notes
                    </p>
                    <textarea
                      rows={2}
                      placeholder="Internal notes (not shown to customer)…"
                      value={notes[order.id] ?? order.admin_notes ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white resize-none transition-colors"
                    />
                    <button
                      onClick={() => update.mutate({ id: order.id, admin_notes: notes[order.id] ?? order.admin_notes ?? '' })}
                      disabled={update.isPending}
                      className="mt-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                    >
                      Save Notes
                    </button>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
