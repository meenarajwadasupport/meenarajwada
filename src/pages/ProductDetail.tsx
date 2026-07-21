import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, Share2, ChevronRight, ZoomIn } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { formatPrice, calcDiscount, cn } from '@/lib/utils'
import SEOHead from '@/components/common/SEOHead'
import { toast } from 'sonner'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug ?? '')
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-2xl font-bold text-foreground mb-2">Product not found</p>
      <p className="text-sm text-muted-foreground mb-6">The piece you're looking for may have been moved or sold out.</p>
      <Link to="/shop" className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.18em]">Browse the Collection</Link>
    </div>
  )

  const wishlisted = isWishlisted(product.id)
  const discount = calcDiscount(product.mrp, product.price)

  function handleAddToCart() {
    if (!selectedSize && product.sizes && product.sizes.length > 1) {
      toast.error('Please select a size')
      return
    }
    addToCart(product, selectedSize || product.sizes?.[0] || 'Free Size', qty)
  }

  return (
    <>
      <SEOHead title={product.name} description={product.description} image={product.images?.[0]} url={`https://www.meenarajwada.com/product/${slug}`} type="product" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground mb-6 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* ── Image gallery ── */}
          <div className="lg:sticky lg:top-[100px] lg:self-start space-y-3.5">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group cursor-zoom-in shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]">
              <img
                src={product.images?.[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              {/* Badges over image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full shadow-md">
                    {discount}% OFF
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="bg-gold text-white text-[10px] font-bold tracking-[0.12em] px-3 py-1.5 rounded-full shadow-md">
                    BESTSELLER
                  </span>
                )}
              </div>
              <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn className="w-4 h-4 text-white" />
              </span>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      'relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-300',
                      i === selectedImg
                        ? 'ring-2 ring-primary ring-offset-2 opacity-100'
                        : 'ring-1 ring-border opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div>
            {/* Title + price */}
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-primary/70 mb-2">Handcrafted Jewellery</p>
            <h1 className="font-serif text-[28px] sm:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4">
              <span className="text-[26px] sm:text-3xl font-bold text-primary leading-none">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-muted-foreground line-through text-base sm:text-lg">{formatPrice(product.mrp)}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    You save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Inclusive of all taxes</p>

            {product.material && (
              <div className="inline-flex items-center gap-2 mt-5 bg-[#FAF7F5] border border-border/60 rounded-full px-4 py-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Material</span>
                <span className="w-px h-3.5 bg-border" />
                <span className="text-xs font-semibold text-foreground">{product.material}</span>
              </div>
            )}

            <div className="h-px bg-gradient-to-r from-border via-border/40 to-transparent my-6" />

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">Select Size</p>
                  {selectedSize && <span className="text-[11px] text-muted-foreground">Selected: <span className="font-semibold text-primary">{selectedSize}</span></span>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[52px] px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95',
                        selectedSize === size
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                          : 'border-border bg-white hover:border-primary/60 hover:text-primary'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2.5">✦ Please check the size chart before placing your order</p>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-7">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">Quantity</p>
              <div className="flex items-center border border-border rounded-full overflow-hidden bg-white">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-lg text-foreground/60 hover:text-primary hover:bg-primary/[0.05] transition-colors active:scale-95"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-lg text-foreground/60 hover:text-primary hover:bg-primary/[0.05] transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2} /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={cn(
                  'w-[52px] flex items-center justify-center border rounded-xl transition-all duration-300 active:scale-95',
                  wishlisted
                    ? 'border-primary bg-primary/[0.06] text-primary shadow-sm'
                    : 'border-border bg-white hover:border-primary hover:text-primary'
                )}
              >
                <Heart className={cn('w-5 h-5 transition-transform duration-300', wishlisted && 'fill-primary scale-110')} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }) }}
                aria-label="Share"
                className="w-[52px] flex items-center justify-center border border-border bg-white rounded-xl hover:border-primary hover:text-primary transition-all duration-300 active:scale-95"
              >
                <Share2 className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                ['Free Shipping', 'On orders ₹999+'],
                ['Handcrafted', 'Made to order'],
                ['Secure Pay', 'Cashfree protected'],
              ].map(([label, sub]) => (
                <div key={label} className="text-center bg-[#FAF7F5] border border-border/50 rounded-xl px-2 py-3.5">
                  <p className="text-[11px] font-bold text-foreground leading-tight">{label}</p>
                  <p className="text-[9.5px] text-muted-foreground mt-1 leading-tight">{sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-7 pt-6 border-t border-border/60">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-foreground mb-3 flex items-center gap-2">
                  Description
                  <span className="w-8 h-px bg-primary/30" />
                </h3>
                <p className="text-[13.5px] text-muted-foreground leading-[1.8]">{product.description}</p>
              </div>
            )}

            {/* Shipping info */}
            <div className="mt-6 bg-gradient-to-br from-[#FAF7F5] to-white border border-border/60 rounded-2xl p-5 text-[13px] space-y-2.5">
              <p className="flex items-start gap-2.5 text-emerald-700 font-semibold">
                <span className="flex-shrink-0 w-4 mt-px">✓</span>
                Free shipping on orders above ₹999
              </p>
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <span className="flex-shrink-0 w-4 mt-px text-primary/60">✓</span>
                Handcrafted &amp; dispatched within 5–7 working days
              </p>
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <span className="flex-shrink-0 w-4 mt-px text-primary/60">✓</span>
                Secure Cashfree payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
