import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Info } from 'lucide-react'
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <SEOHead title="Cart" />
        <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some beautiful jewellery to get started!</p>
        <Link to="/shop" className="btn-primary px-8 py-3 mt-2">Browse Jewellery</Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead title="Your Cart" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={`${item.product_id}-${item.size}`} className="flex gap-4 bg-white rounded-2xl p-4 border border-border">
                <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-24 h-24 object-cover rounded-xl bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight">{item.product?.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                  <p className="font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-border rounded-md hover:bg-muted"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-border rounded-md hover:bg-muted"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.product_id, item.size)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-border h-fit">
            <h2 className="font-serif text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              {shipping > 0 && remainingForFreeShipping > 0 && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1.5">Add {formatPrice(remainingForFreeShipping)} more for FREE shipping</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Pre-order notice */}
            <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">These are <strong>pre-order items</strong>. Payment is collected now and your piece is handcrafted & dispatched within 5–7 working days.</p>
            </div>

            {/* Minimum order warning */}
            {belowMinimum && (
              <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">Minimum order amount is <strong>₹500</strong>. Add {formatPrice(MIN_ORDER_AMOUNT - subtotal)} more to proceed.</p>
              </div>
            )}

            <button
              onClick={() => navigate('/checkout')}
              disabled={belowMinimum}
              className="btn-primary w-full py-3 mt-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >Proceed to Checkout</button>
            <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-primary mt-3 transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  )
}
