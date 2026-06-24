import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { cn } from '@/lib/utils'

export default function OurPickBestSeller() {
  const { data: products = [] } = useProducts({ limit: 12 })
  const bestsellers = products.filter(p => p.is_bestseller).slice(0, 8)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const display = bestsellers.length >= 2 ? bestsellers : products.slice(0, 8)

  return (
    <section className="py-12 sm:py-14" style={{ background: 'hsl(345 30% 97%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">

        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.38em] uppercase text-primary mb-1">Our Pick</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Best Seller
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1 pb-1">
            View All {'>>'}
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {display.map(product => {
            const discount = product.mrp > product.price
              ? Math.round((1 - product.price / product.mrp) * 100) : 0
            const wishlisted = isWishlisted(product.id)

            return (
              <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">

                {/* Image */}
                <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                    {discount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        -{discount}%
                      </span>
                    )}
                    {product.is_bestseller && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        Bestseller
                      </span>
                    )}
                  </div>

                  {/* 3 circle action buttons — always visible on mobile, hover on desktop */}
                  <div className={cn(
                    'absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2.5 pb-3 pt-6',
                    'translate-y-0 opacity-100',
                    'md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:transition-all md:duration-250',
                  )}>
                    {/* Cart */}
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); addToCart(product, product.sizes?.[0] ?? 'Free Size', 1) }}
                      title="Add to Cart"
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>

                    {/* Wishlist */}
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}
                      title="Wishlist"
                      className={cn(
                        'w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center transition-colors duration-200',
                        wishlisted ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-primary hover:text-white'
                      )}
                    >
                      <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-current')} />
                    </button>

                    {/* View */}
                    <Link
                      to={`/product/${product.slug}`}
                      title="View Product"
                      onClick={e => e.stopPropagation()}
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link to={`/product/${product.slug}`}>
                    <p className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2 mb-1.5"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-primary font-bold text-sm">
                      &#8377;{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-muted-foreground text-xs line-through">
                        &#8377;{product.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
