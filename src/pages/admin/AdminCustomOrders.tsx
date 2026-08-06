import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Phone, Mail, IndianRupee, MessageSquare, Loader2, Sparkles, MessageCircle, Trash2 } from 'lucide-react'

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

  // ── Direct DB update (no server API needed — works without Vercel env vars) ──
  const update = useMutation({
    mutationFn: async ({ id, status, quoted_price, admin_notes, send_email }: {
      id: string; status?: string; quoted_price?: number; admin_notes?: string; send_email?: boolean
    }) => {
      // 1. Update the DB directly via Supabase client
      const payload: Record<string, any> = {}
      if (status      !== undefined) payload.status      = status
      if (quoted_price !== undefined) payload.quoted_price = quoted_price
      if (admin_notes  !== undefined) payload.admin_notes  = admin_notes

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase
          .from('custom_order_requests')
          .update(payload)
          .eq('id', id)
        if (error) throw new Error(error.message)
      }

      // 2. Send email via API only if requested (requires RESEND_API_KEY in Vercel)
      if (send_email && quoted_price) {
        // Find the order from local cache so we don't need Supabase in the API
        const order = (orders as any[]).find((o: any) => o.id === id)
        const customerEmail = order?.email ?? order?.customer_email ?? ''
        const customerName  = order?.name  ?? order?.customer_name  ?? 'Valued Customer'
        const designType    = order?.piece_type ?? order?.design_type ?? ''
        const description   = order?.description ?? ''
        const occasion      = order?.occasion ?? ''

        try {
          const res = await fetch('/api/admin-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send_quote_email',
              customer_email: customerEmail,
              customer_name:  customerName,
              design_type:    designType,
              description,
              occasion,
              quoted_price,
            }),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) {
            toast.warning('Quote saved — email not sent (server error)')
            return { email_sent: false }
          }
          if (json.email_sent === false) {
            const hint = json.email_error?.includes('RESEND_API_KEY')
              ? 'Add RESEND_API_KEY in Vercel → Settings → Environment Variables'
              : (json.email_error ?? 'Email provider error')
            toast.warning(`Quote saved ✓ — email not sent: ${hint}`)
            return { email_sent: false }
          }
          return { email_sent: true }
        } catch {
          toast.warning('Quote saved ✓ — email not sent (network error)')
          return { email_sent: false }
        }
      }
      return { email_sent: false }
    },
    onSuccess: (result: any, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-custom-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-badges'] })
      if (vars.send_email && result?.email_sent) toast.success('Quote saved and email sent ✓')
      else if (!vars.send_email) toast.success('Saved ✓')
      // If send_email but !email_sent — warning was already shown inside mutationFn
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not update'),
  })

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_order_requests').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-custom-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-badges'] })
      toast.success('Order deleted')
    },
    onError: (e: any) => toast.error(e.message ?? 'Could not delete'),
  })

  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: orders.filter((o: any) => o.status === s).length
  }), {} as Record<string, number>)

  function whatsappLink(order: any) {
    const phone = String(order.phone ?? order.customer_phone ?? '').replace(/[^0-9]/g, '')
    const withCountry = phone.length === 10 ? `91${phone}` : phone
    const customerName = order.name ?? order.customer_name ?? 'there'
    const text = encodeURIComponent(`Hello ${customerName}, this is Meena Rajwada regarding your custom jewellery request. `)
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
                    {(order.name ?? order.customer_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{order.name ?? order.customer_name ?? '—'}</p>
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

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status ?? 'new'] ?? 'bg-blue-100 text-blue-700'}`}>
                  {(order.status ?? 'new').replace('_', ' ')}
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
                      {/* Support both old (email) and new (customer_email) column names */}
                      {(order.email || order.customer_email) ? (
                        <a href={`mailto:${order.email ?? order.customer_email}`} className="flex items-center gap-2 hover:text-primary transition-colors break-all">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          {order.email ?? order.customer_email}
                        </a>
                      ) : (
                        <p className="flex items-center gap-2 text-muted-foreground/60 text-xs italic">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" /> No email on record
                        </p>
                      )}
                      {(order.phone || order.customer_phone) ? (
                        <a href={`tel:${order.phone ?? order.customer_phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          {order.phone ?? order.customer_phone}
                        </a>
                      ) : (
                        <p className="flex items-center gap-2 text-muted-foreground/60 text-xs italic">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" /> No phone on record
                        </p>
                      )}
                      {(order.phone || order.customer_phone) && (
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
                      {(order.piece_type || order.design_type) && <p><span className="text-muted-foreground text-xs">Type:</span> {order.piece_type ?? order.design_type}</p>}
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

                  {/* Reference Image — supports both old array field and new single-URL field */}
                  {(order.reference_image_url || order.reference_images?.length > 0) && (
                    <div className="bg-white rounded-xl border border-border p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Reference Image from Customer</p>
                      <div className="flex flex-wrap gap-3">
                        {/* New single-URL field */}
                        {order.reference_image_url && (
                          <a href={order.reference_image_url} target="_blank" rel="noopener noreferrer" className="group block">
                            <img
                              src={order.reference_image_url}
                              alt="Customer reference"
                              className="w-40 h-40 object-cover rounded-xl border-2 border-border group-hover:border-primary transition-all shadow-sm group-hover:shadow-md"
                            />
                            <p className="text-[10px] text-primary mt-1 text-center group-hover:underline">Click to open full size</p>
                          </a>
                        )}
                        {/* Legacy array field */}
                        {order.reference_images?.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group block">
                            <img src={url} alt="" className="w-40 h-40 object-cover rounded-xl border-2 border-border group-hover:border-primary transition-all shadow-sm" />
                            <p className="text-[10px] text-primary mt-1 text-center group-hover:underline">Click to open full size</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-3 border-t border-border">

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</label>
                      <select value={order.status ?? 'new'}
                        onChange={e => update.mutate({ id: order.id, status: e.target.value })}
                        disabled={update.isPending}
                        className="flex-1 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white capitalize disabled:opacity-60 transition-colors">
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>

                    {/* Quoted Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <IndianRupee className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="number"
                        placeholder="Quote price ₹"
                        value={quotes[order.id] ?? (order.quoted_price ? String(order.quoted_price) : '')}
                        onChange={e => setQuotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="w-32 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white transition-colors"
                      />
                      <button
                        onClick={() => quotes[order.id] && update.mutate({
                          id: order.id,
                          quoted_price: Number(quotes[order.id]),
                          status: 'quoted',
                          send_email: true,
                        })}
                        disabled={update.isPending || !quotes[order.id]}
                        title="Saves the quote price and sends a professional email to the customer"
                        className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {update.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Send Quote via Email
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
                    <div className="flex items-center justify-between mt-1.5">
                      <button
                        onClick={() => update.mutate({ id: order.id, admin_notes: notes[order.id] ?? order.admin_notes ?? '' })}
                        disabled={update.isPending}
                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete this order from ${order.customer_name}? This cannot be undone.`)) {
                            deleteOrder.mutate(order.id)
                          }
                        }}
                        disabled={deleteOrder.isPending}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Order
                      </button>
                    </div>
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
