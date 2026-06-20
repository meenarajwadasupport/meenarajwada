import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const STATUSES = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: async () => {
      let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      if (filterStatus !== 'all') q = q.eq('status', filterStatus)
      const { data } = await q
      return data ?? []
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, tracking_id }: { id: string; status: string; tracking_id?: string }) => {
      const update: any = { status }
      if (tracking_id) update.tracking_id = tracking_id
      await supabase.from('orders').update(update).eq('id', id)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated') },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Orders</h1>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="all">All Orders</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <p className="font-mono font-semibold text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_name} · {order.customer_phone}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
              </div>
              {expanded === order.id && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Email: {order.customer_email}</p>
                    <p>Address: {order.shipping_address?.address}, {order.shipping_address?.city}, {order.shipping_address?.state} – {order.shipping_address?.pincode}</p>
                  </div>
                  <div className="space-y-1">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-xs">{item.product_name} × {item.quantity} ({item.size}) — {formatPrice(item.price * item.quantity)}</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <select
                      value={order.status}
                      onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm outline-none bg-white"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                    <input
                      placeholder="Tracking ID (optional)"
                      defaultValue={order.tracking_id ?? ''}
                      onBlur={e => e.target.value && updateStatus.mutate({ id: order.id, status: order.status, tracking_id: e.target.value })}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No orders found.</p>}
        </div>
      )}
    </div>
  )
}
