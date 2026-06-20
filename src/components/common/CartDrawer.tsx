import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, calcShipping } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, itemCount, subtotal } = useCart()
  const navigate = useNavigate()
  const shipping = calcShipping(subtotal)

  function checkout() {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-serif text-lg font-semibold">Your Cart ({itemCount})</h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-md"><X className="w-5 h-5" /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <button onClick={() => { onClose(); navigate('/shop') }} className="btn-primary">Browse Jewellery</button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-20 h-20 object-cover rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{item.product?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                  <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center border border-border rounded">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center border border-border rounded">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product_id, item.size)} className="p-1 text-muted-foreground hover:text-red-500 self-start">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">Add {formatPrice(5000 - subtotal)} more for free shipping</p>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(subtotal + shipping)}</span>
            </div>
            <button onClick={checkout} className="btn-primary w-full py-3 text-base">Proceed to Checkout</button>
            <button onClick={() => { onClose(); navigate('/cart') }} className="btn-outline w-full py-2 text-sm">View Cart</button>
          </div>
        )}
      </div>
    </>
  )
}
