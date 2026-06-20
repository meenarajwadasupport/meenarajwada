import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import { toast } from 'sonner'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, size: string, quantity?: number) => void
  removeFromCart: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addToCart(product: Product, size: string, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.size === size)
      if (existing) {
        toast.success('Cart updated')
        return prev.map(i =>
          i.product_id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      toast.success('Added to cart')
      return [...prev, { product_id: product.id, product, size, quantity, price: product.price }]
    })
  }

  function removeFromCart(productId: string, size: string) {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.size === size)))
    toast.success('Removed from cart')
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    if (quantity < 1) { removeFromCart(productId, size); return }
    setItems(prev => prev.map(i =>
      i.product_id === productId && i.size === size ? { ...i, quantity } : i
    ))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
