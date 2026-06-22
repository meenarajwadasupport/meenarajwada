import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, calcDiscount } from '@/lib/utils'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToCart } = useCart()
  const wishlisted = isWishlisted(product.id)
  const discount = calcDiscount(product.mrp, product.price)

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    const defaultSize = product.sizes?.[0] ?? 'Free Size'
    addToCart(product, defaultSize)
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop' }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new_arrival && <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
          {product.is_bestseller && <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BESTSELLER</span>}
          {discount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>}
        </div>
        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product) }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:scale-110 transition-transform"
        >
          <Heart className={cn('w-4 h-4', wishlisted ? 'fill-primary text-primary' : 'text-muted-foreground')} />
        </button>
        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        {product.material && <p className="text-xs text-muted-foreground mt-0.5">{product.material}</p>}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
