import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronDown, ChevronUp, Truck, CheckCircle, XCircle, Clock, Phone, Mail, MapPin, Loader2, Package, RotateCcw } from 'lucide-react'

const STATUSES = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  dispatched: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
}

const PAYMENT_ICON: Record<string, JSX.Element> = {
  paid:     <CheckCircle className="w-4 h-4 text-green-500" />,
  failed:   <XCircle className="w-4 h-4 text-red-500" />,
  pending:  <Clock className="w-4 h-4 text-yellow-500" />,
  refunded: <RotateCcw className="w-4 h-4 text-gray-400" />,
}

const PAYMENT_BADGE: Record<string, string> = {
  paid:     'bg-green-50 text-green-700 border-green-200',
  failed:   'bg-red-50 text-red-700 border-red-200',
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  refunded: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: async () => {
      let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      if (filterStatus !== 'all') q = q.eq('status', filterStatus)
      const { data } = await q
      return data ?? []
    },
  })

  const updateOrder = useMutation({
    mutationFn: async ({ id, status, tracking_id, courier }: { id: string; status?: string; tracking_id?: string; courier?: string }) => {
      const update: any = { updated_at: new Date().toISOString() }
      if (status)     update.status     = status
      if (tracking_id) update.tracking_id = tracking_id
      if (courier)    update.courier    = courier
      await supabase.from('orders').update(update).eq('id', id)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated') },
    onError: () => toast.error('Could not update order'),
  })

  const filtered = orders.filter((o: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.includes(q) ||
      o.id?.toLowerCase().includes(q)
    )
  })

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o: any) => o.status === s).length }), {} as Record<string, number>)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {orders.length} order{orders.length === 1 ? '' : 's'}{filterStatus !== 'all' ? ` · filtered by "${filterStatus}"` : ''} · click an order to see details
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterStatus === 'all' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-colors ${filterStatus === s ? `${STATUS_COLOR[s]} border-current shadow-sm` : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, phone, order ID…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white transition-colors"
        />
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No orders found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search
              ? `Nothing matches "${search}". Try a different name, email or order ID.`
              : filterStatus !== 'all'
                ? `There are no ${filterStatus} orders right now.`
                : 'New orders from the website will appear here as soon as customers check out.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => (
            <div key={order.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-shadow ${expanded === order.id ? 'border-primary/40 shadow-md' : 'border-border hover:shadow-md'}`}>

              {/* Order Row */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* ID + date */}
                <div className="min-w-0">
                  <p className="font-mono font-bold text-sm text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>

                {/* Customer */}
                <div className="flex-1 min-w-[120px]">
                  <p className="font-semibold text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                </div>

                {/* Items count */}
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                </span>

                {/* Amount */}
                <p className="font-bold text-primary text-sm">{formatPrice(order.total_amount)}</p>

                {/* Payment */}
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${PAYMENT_BADGE[order.payment_status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {PAYMENT_ICON[order.payment_status] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                  <span className="hidden sm:inline">{order.payment_status}</span>
                </span>

                {/* Status */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLOR[order.status]}`}>
                  {order.status}
                </span>

                {/* Expand icon */}
                {expanded === order.id
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
              </div>

              {/* Expanded Detail */}
              {expanded === order.id && (
                <div className="border-t border-border p-4 space-y-4 bg-background/30">

                  {/* Customer Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-border p-4 space-y-1.5 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer</p>
                      <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_email}
                      </a>
                      <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_phone}
                      </a>
                      {order.shipping_address && (
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs leading-relaxed">
                            {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-border p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Items Ordered</p>
                      <div className="space-y-1.5">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs gap-2">
                            <span className="text-foreground">{item.product_name} × {item.quantity}
                              {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                            </span>
                            <span className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold border-t border-border pt-1.5 mt-1.5">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-border items-center">
                    {/* Status update */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Status:</label>
                      <select
                        value={order.status}
                        onChange={e => updateOrder.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateOrder.isPending}
                        className="border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white capitalize disabled:opacity-60 transition-colors"
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>

                    {/* Tracking */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px] flex-wrap sm:flex-nowrap">
                      <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        placeholder="Tracking ID"
                        value={trackingInputs[order.id] ?? order.tracking_id ?? ''}
                        onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="flex-1 min-w-[120px] border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white transition-colors"
                      />
                      <input
                        placeholder="Courier (e.g. BlueDart)"
                        defaultValue={order.courier ?? ''}
                        onBlur={e => e.target.value && updateOrder.mutate({ id: order.id, courier: e.target.value })}
                        className="w-28 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white transition-colors"
                      />
                      <button
                        onClick={() => {
                          const tid = trackingInputs[order.id]
                          if (tid) updateOrder.mutate({ id: order.id, tracking_id: tid, status: 'dispatched' })
                        }}
                        disabled={updateOrder.isPending}
                        className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-60 inline-flex items-center gap-1.5"
                      >
                        {updateOrder.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        Mark Dispatched
                      </button>
                    </div>
                  </div>

                  {order.tracking_id && (
                    <p className="text-xs text-muted-foreground bg-white border border-border rounded-lg px-3 py-2 inline-flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" />
                      Tracking: <span className="font-mono font-semibold text-foreground">{order.tracking_id}</span>
                      {order.courier && <span> via {order.courier}</span>}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
