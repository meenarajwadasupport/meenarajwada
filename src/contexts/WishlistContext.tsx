import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'
import { toast } from 'sonner'

interface WishlistContextType {
  wishlist: Product[]
  toggleWishlist: (product: Product) => void
  isWishlisted: (productId: string) => boolean
  count: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  function toggleWishlist(product: Product) {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) {
        toast.success('Removed from wishlist')
        return prev.filter(p => p.id !== product.id)
      }
      toast.success('Added to wishlist')
      return [...prev, product]
    })
  }

  function isWishlisted(productId: string) {
    return wishlist.some(p => p.id === productId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
