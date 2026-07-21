import { useSearchParams, Link } from 'react-router-dom'
import { useOrder } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import { Package, Sparkles, Truck, CheckCircle, ShoppingBag } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const NEXT_STEPS = [
  {
    icon: Sparkles,
    title: 'Crafting Begins',
    body: 'Our artisans start handcrafting your piece within 24 hours of your order.',
  },
  {
    icon: Package,
    title: 'Carefully Packed',
    body: 'Your jewellery is wrapped and boxed with care. You\'ll receive a dispatch email.',
  },
  {
    icon: Truck,
    title: 'On Its Way',
    body: 'Dispatched within 5–7 working days. Track your order via the link in your email.',
  },
  {
    icon: CheckCircle,
    title: 'Delivered',
    body: 'Your piece arrives at your door, ready to wear and cherish.',
  },
]

export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') ?? ''
  const { data: order } = useOrder(orderId)

  return (
    <>
      <SEOHead title="Order Confirmed — Meena Rajwada" />

      {/* ── Celebratory header ── */}
      <div className="bg-[#7D1935] text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" strokeWidth={1.75} />
          </div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/60 mb-3">Payment Successful</p>
          <h1 className="font-serif text-[36px] sm:text-[50px] font-bold text-white leading-tight mb-4">
            Your Order<br />is Confirmed ✨
          </h1>
          <p className="text-[15px] text-white/70 max-w-md mx-auto leading-relaxed">
            Thank you for choosing Meena Rajwada. Your piece will be handcrafted with love and dispatched within 5–7 working days.
          </p>
          {order?.order_number && (
            <div className="inline-block mt-8 bg-white/10 border border-white/20 rounded-2xl px-8 py-4">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 mb-1">Order Number</p>
              <p className="font-mono text-[24px] font-bold text-white tracking-wider">{order.order_number}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-10">

        {/* ── Order details card ── */}
        {order && (
          <div className="bg-white border border-[#ece3dc] rounded-3xl overflow-hidden shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">
            {/* Card header */}
            <div className="bg-[#FAF7F5] border-b border-[#ece3dc] px-7 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#7D1935]" strokeWidth={1.75} />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#9a8880]">Order Summary</span>
              </div>
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#7D1935]">{order.status ?? 'Confirmed'}</span>
            </div>

            <div className="px-7 py-6 space-y-5">
              {/* Order meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-5 border-b border-[#ece3dc]">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9a8880] mb-1">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-[#1a0a08]">
                    {order.order_number ?? order.id?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9a8880] mb-1">Total Paid</p>
                  <p className="text-sm font-bold text-[#7D1935]">{formatPrice(order.total_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9a8880] mb-1">Dispatch In</p>
                  <p className="text-sm font-semibold text-[#1a0a08]">5–7 working days</p>
                </div>
              </div>

              {/* Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="space-y-4">
                  {order.order_items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      {item.image_url && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F5] flex-shrink-0 border border-[#ece3dc]">
                          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1a0a08] leading-tight">{item.product_name}</p>
                        <p className="text-[12px] text-[#9a8880] mt-0.5">
                          {item.size && item.size !== 'Free Size' ? `Size: ${item.size} · ` : ''}Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-[14px] font-bold text-[#1a0a08] flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-[#ece3dc] pt-5 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#9a8880]">Subtotal</span>
                  <span className="text-[#1a0a08]">{formatPrice(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#9a8880]">Shipping</span>
                  <span className={(order.shipping_amount ?? 0) === 0 ? 'text-emerald-600 font-semibold' : 'text-[#1a0a08]'}>
                    {(order.shipping_amount ?? 0) === 0 ? 'FREE' : formatPrice(order.shipping_amount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[16px] pt-2 border-t border-[#ece3dc]">
                  <span className="text-[#1a0a08]">Total</span>
                  <span className="text-[#7D1935]">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── What happens next ── */}
        <div>
          <h2 className="font-serif text-[24px] font-bold text-[#1a0a08] mb-8">What Happens Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NEXT_STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className="flex gap-4 bg-white border border-[#ece3dc] rounded-2xl p-5 hover:border-[#7D1935]/25 hover:shadow-[0_4px_24px_-8px_rgba(125,25,53,0.08)] transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#7D1935]/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#7D1935]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1a0a08] mb-1">{title}</p>
                  <p className="text-[12px] text-[#9a8880] leading-[1.7]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Reminder ── */}
        <div className="bg-[#FAF7F5] border border-[#ece3dc] rounded-2xl p-6 text-center">
          <p className="text-[14px] text-[#6b5a55] leading-relaxed">
            A confirmation email has been sent to <strong className="text-[#1a0a08]">{order?.customer_email ?? 'your inbox'}</strong>.<br />
            For any questions, reach us on <a href="https://wa.me/916304424767" className="text-[#7D1935] font-semibold hover:underline">WhatsApp</a> or at <a href="mailto:support@meenarajwada.com" className="text-[#7D1935] font-semibold hover:underline">support@meenarajwada.com</a>.
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/my-orders"
            className="flex-1 sm:flex-none bg-[#7D1935] hover:bg-[#9a1f40] text-white text-center px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            View My Orders
          </Link>
          <Link
            to="/shop"
            className="flex-1 sm:flex-none border border-[#7D1935]/30 hover:border-[#7D1935] text-[#7D1935] text-center px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#7D1935]/5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  )
}
