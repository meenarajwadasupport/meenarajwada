import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronDown, ChevronUp, Truck, CheckCircle, XCircle, Clock, Phone, Mail, MapPin } from 'lucide-react'

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
  refunded: <ChevronDown className="w-4 h-4 text-gray-400" />,
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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filterStatus === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize transition-colors ${filterStatus === s ? `${STATUS_COLOR[s]} border-current` : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
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
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary bg-white"
        />
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden">

              {/* Order Row */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* ID + date */}
                <div className="min-w-0">
                  <p className="font-mono font-bold text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
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
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                </span>

                {/* Amount */}
                <p className="font-bold text-primary text-sm">{formatPrice(order.total_amount)}</p>

                {/* Payment */}
                <div className="flex items-center gap-1">
                  {PAYMENT_ICON[order.payment_status] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-[10px] text-muted-foreground capitalize hidden sm:block">{order.payment_status}</span>
                </div>

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
                    <div className="space-y-1.5 text-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer</p>
                      <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_email}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{order.customer_phone}</p>
                      {order.shipping_address && (
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs">
                            {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Items Ordered</p>
                      <div className="space-y-1.5">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-foreground">{item.product_name} × {item.quantity}
                              {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                            </span>
                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
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
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
                    {/* Status update */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Status:</label>
                      <select
                        value={order.status}
                        onChange={e => updateOrder.mutate({ id: order.id, status: e.target.value })}
                        className="border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white capitalize"
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>

                    {/* Tracking */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        placeholder="Tracking ID"
                        value={trackingInputs[order.id] ?? order.tracking_id ?? ''}
                        onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
                      />
                      <input
                        placeholder="Courier (e.g. BlueDart)"
                        defaultValue={order.courier ?? ''}
                        onBlur={e => e.target.value && updateOrder.mutate({ id: order.id, courier: e.target.value })}
                        className="w-28 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
                      />
                      <button
                        onClick={() => {
                          const tid = trackingInputs[order.id]
                          if (tid) updateOrder.mutate({ id: order.id, tracking_id: tid, status: 'dispatched' })
                        }}
                        className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        Mark Dispatched
                      </button>
                    </div>
                  </div>

                  {order.tracking_id && (
                    <p className="text-xs text-muted-foreground">
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
