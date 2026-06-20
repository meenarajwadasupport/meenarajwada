import { useSearchParams, Link } from 'react-router-dom'
import { useOrder } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Package } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') ?? ''
  const { data: order } = useOrder(orderId)

  return (
    <>
      <SEOHead title="Order Confirmed" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">We'll dispatch your jewellery within 3–5 working days. You'll receive a dispatch email.</p>
        </div>

        {order && (
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 text-primary font-medium"><Package className="w-3 h-3" /> {order.status}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Total Paid</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
            {order.order_items && order.order_items.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">Items Ordered</p>
                {order.order_items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-8 justify-center">
          <Link to="/my-orders" className="btn-primary px-8 py-3">My Orders</Link>
          <Link to="/shop" className="btn-outline px-8 py-3">Shop More</Link>
        </div>
      </div>
    </>
  )
}
