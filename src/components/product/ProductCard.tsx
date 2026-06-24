import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
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
    e.stopPropagation()
    const defaultSize = product.sizes?.[0] ?? 'Free Size'
    addToCart(product, defaultSize)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col">

      {/* ── Image area ── */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted flex-shrink-0">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop'
          }}
        />

        {/* Subtle dark overlay on hover (desktop) */}
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

        {/* ── Badges (top-left) ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          {discount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow-sm">
              -{discount}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow-sm">
              NEW
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* ── 3 action buttons — slide up on desktop hover, always visible on mobile ── */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2.5 pb-3 pt-6',
          // Mobile: always shown, slide in from bottom slightly
          'translate-y-0 opacity-100',
          // Desktop: hidden until hover, slides up
          'md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:transition-all md:duration-250',
        )}>
          {/* Cart */}
          <button
            onClick={handleQuickAdd}
            title="Add to Cart"
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={cn(
              'w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors duration-200',
              wishlisted
                ? 'bg-primary text-white'
                : 'bg-white text-foreground hover:bg-primary hover:text-white'
            )}
          >
            <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
          </button>

          {/* Quick view */}
          <Link
            to={`/product/${product.slug}`}
            title="View Product"
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors duration-200"
            onClick={e => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </Link>

      {/* ── Product info ── */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground leading-snug hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.material && (
          <p className="text-xs text-muted-foreground mt-0.5">{product.material}</p>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>

        {/* Add to Cart — full width, mobile only */}
        <button
          onClick={handleQuickAdd}
          className="md:hidden mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-widest border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 active:scale-95"
        >
          <ShoppingBag className="w-3 h-3" />
          Add to Cart
        </button>
      </div>

    </div>
  )
}
