import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/contexts/WishlistContext'

// ── CHANGE THESE TWO LINES FOR FESTIVALS ──────────────────────────────────────
// Normal:          label = 'Handcrafted for You'   title = 'Best Sellers'
// Pongal:          label = 'Pongal Special'         title = 'Pongal Discount Sets'
// Diwali:          label = 'Diwali Collection'      title = 'Festive Deals'
const SECTION_LABEL = 'Handcrafted for You'
const SECTION_TITLE = 'Best Sellers'
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedProducts() {
  const { data: products = [] } = useProducts({ featured: true, limit: 4 })
  const { toggleWishlist, isWishlisted } = useWishlist()

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">

        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2">
              {SECTION_LABEL}
            </p>
            <h2
              className="text-[26px] sm:text-4xl font-bold text-foreground leading-none"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {SECTION_TITLE}
            </h2>
            <span className="block w-14 h-[2px] bg-gradient-to-r from-primary to-primary/20 mt-3.5 rounded-full" />
          </div>
          <Link
            to="/shop"
            className="group flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary pb-1 border-b border-primary/25 hover:border-primary transition-colors whitespace-nowrap"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* 4-card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map(product => {
            const discount = product.mrp > product.price
              ? Math.round((1 - product.price / product.mrp) * 100)
              : 0
            const wishlisted = isWishlisted(product.id)

            return (
              <Link key={product.id} to={`/product/${product.slug}`} className="group block">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted mb-3.5 shadow-sm group-hover:shadow-xl group-hover:shadow-black/10 transition-shadow duration-500">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
                  />

                  {/* Discount / New badge */}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full shadow-md">
                      {discount}% OFF
                    </span>
                  )}
                  {product.is_new_arrival && discount === 0 && (
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full shadow-md">
                      NEW
                    </span>
                  )}

                  {/* Wishlist heart */}
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 ${
                      wishlisted
                        ? 'bg-primary text-white'
                        : 'bg-white/90 text-foreground/60 hover:text-primary md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.75} />
                  </button>

                  {/* Bottom gradient + quick-view pill */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3.5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
                    <span className="bg-white/95 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-[0.18em] px-5 py-2.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors duration-300">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Info */}
                <p className="text-[15px] sm:text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5em]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {product.name}
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-primary font-bold text-[15px]">
                    &#8377;{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-muted-foreground text-xs line-through">
                        &#8377;{product.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-emerald-600 text-[10px] font-bold tracking-wide">SAVE {discount}%</span>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
