import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Info, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, calcShipping, MIN_ORDER_AMOUNT } from '@/lib/utils'
import SEOHead from '@/components/common/SEOHead'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()
  const navigate = useNavigate()
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping
  const belowMinimum = subtotal < MIN_ORDER_AMOUNT
  const remainingForFreeShipping = 999 - subtotal

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-5">
        <SEOHead title="Cart — Meena Rajwada" />
        <div className="w-20 h-20 rounded-full bg-[#7D1935]/8 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-[#7D1935]/50" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="font-serif text-[28px] font-bold text-[#1a0a08] mb-2">Your cart is empty</h2>
          <p className="text-[14px] text-[#9a8880] max-w-xs">Discover our handcrafted jewellery and add something beautiful.</p>
        </div>
        <Link
          to="/shop"
          className="bg-[#7D1935] hover:bg-[#9a1f40] text-white px-10 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 mt-2"
        >
          Browse Jewellery
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead title="Your Cart — Meena Rajwada" />

      {/* ── Page header ── */}
      <div className="bg-[#FAF7F5] border-b border-[#ece3dc]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 pb-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-2">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <h1 className="font-serif text-[34px] sm:text-[44px] font-bold text-[#1a0a08]">Your Cart</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">

          {/* ── Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={`${item.product_id}-${item.size}`}
                className="flex gap-5 bg-white rounded-2xl p-4 sm:p-5 border border-[#ece3dc] hover:border-[#7D1935]/20 hover:shadow-[0_4px_24px_-8px_rgba(125,25,53,0.08)] transition-all duration-300"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#FAF7F5] flex-shrink-0 border border-[#ece3dc]">
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[14px] text-[#1a0a08] leading-snug">{item.product?.name}</h3>
                    {item.size && <p className="text-[12px] text-[#9a8880] mt-0.5">Size: {item.size}</p>}
                    <p className="font-bold text-[15px] text-[#7D1935] mt-2">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-[#e8ddd8] rounded-full overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                        aria-label="Decrease"
                        className="w-9 h-9 flex items-center justify-center text-[#9a8880] hover:text-[#7D1935] hover:bg-[#7D1935]/5 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold text-[#1a0a08] tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                        aria-label="Increase"
                        className="w-9 h-9 flex items-center justify-center text-[#9a8880] hover:text-[#7D1935] hover:bg-[#7D1935]/5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-bold text-[#1a0a08]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.size)}
                        aria-label="Remove item"
                        className="text-[#c4b4ae] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#7D1935] hover:underline mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#ece3dc] rounded-3xl p-6 shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)] sticky top-24">
              <h2 className="font-serif text-[20px] font-bold text-[#1a0a08] mb-6">Order Summary</h2>

              <div className="space-y-3.5 text-[13.5px] border-b border-[#ece3dc] pb-5 mb-5">
                <div className="flex justify-between">
                  <span className="text-[#9a8880]">Subtotal</span>
                  <span className="font-semibold text-[#1a0a08]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9a8880]">Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-semibold' : 'font-semibold text-[#1a0a08]'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && remainingForFreeShipping > 0 && (
                  <p className="text-[11.5px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 leading-relaxed">
                    Add {formatPrice(remainingForFreeShipping)} more for <strong>FREE shipping</strong>
                  </p>
                )}
              </div>

              <div className="flex justify-between font-bold text-[17px] mb-6">
                <span className="text-[#1a0a08]">Total</span>
                <span className="text-[#7D1935]">{formatPrice(total)}</span>
              </div>

              {/* Pre-order notice */}
              <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200/70 rounded-xl p-3.5 mb-3">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  <strong>Pre-order:</strong> Payment is collected now. Your piece is handcrafted &amp; dispatched within 5–7 working days.
                </p>
              </div>

              {/* Min order warning */}
              {belowMinimum && (
                <div className="flex gap-2.5 items-start bg-red-50 border border-red-200/70 rounded-xl p-3.5 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[12px] text-red-700 leading-relaxed">
                    Minimum order is <strong>₹500</strong>. Add {formatPrice(MIN_ORDER_AMOUNT - subtotal)} more to proceed.
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                disabled={belowMinimum}
                className="w-full flex items-center justify-center gap-2.5 bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-[#b8a8a2] mt-4">🔒 Secured by Cashfree Payments</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
