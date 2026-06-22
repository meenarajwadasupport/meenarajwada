import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

export default function OurPickBestSeller() {
  const { data: products = [] } = useProducts({ limit: 8 })
  const bestsellers = products.filter(p => p.is_bestseller).slice(0, 4)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  // Fallback to first 4 if no bestsellers tagged
  const display = bestsellers.length >= 2 ? bestsellers : products.slice(0, 4)

  return (
    <section className="py-12 sm:py-14" style={{ background: 'hsl(345 30% 97%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">

        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.38em] uppercase text-primary mb-1">
              Our Pick
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Best Seller
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1 pb-1"
          >
            View All {'>>'}
          </Link>
        </div>

        {/* Product cards — portrait style, different from FeaturedProducts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {display.map(product => {
            const discount = product.mrp > product.price
              ? Math.round((1 - product.price / product.mrp) * 100)
              : 0
            const wishlisted = isWishlisted(product.id)

            return (
              <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">

                {/* Image — portrait ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {discount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    {product.is_bestseller && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Bestseller
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                      wishlisted ? 'bg-primary text-white' : 'bg-white/80 text-foreground/60 hover:text-primary'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <Link to={`/product/${product.slug}`}>
                    <p className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2 mb-1.5"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-primary font-bold text-sm">
                      &#8377;{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-muted-foreground text-xs line-through">
                        &#8377;{product.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={() => addToCart(product, product.sizes[0] ?? 'Free Size', 1)}
                    className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary hover:text-white text-primary text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg transition-colors duration-200"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
