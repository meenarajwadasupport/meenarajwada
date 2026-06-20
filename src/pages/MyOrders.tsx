import { Link } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function MyOrders() {
  const { data: orders = [], isLoading } = useOrders()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <>
      <SEOHead title="My Orders" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <ShoppingBag className="w-14 h-14 text-muted-foreground/40" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn-primary px-8 py-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-muted text-foreground'}`}>
                    {order.status}
                  </span>
                </div>
                {order.order_items?.slice(0, 2).map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 mb-2">
                    <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{item.product_name} <span className="text-muted-foreground">× {item.quantity}</span></p>
                  </div>
                ))}
                {(order.order_items?.length ?? 0) > 2 && (
                  <p className="text-xs text-muted-foreground ml-7">+{order.order_items.length - 2} more items</p>
                )}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  <Link to={`/order-confirmation?order_id=${order.id}`} className="text-sm text-primary hover:underline">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
