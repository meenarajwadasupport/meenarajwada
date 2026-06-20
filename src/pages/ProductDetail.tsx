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
  if (!product) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Product not found.</div>

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group cursor-zoom-in">
              <img src={product.images?.[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
              <ZoomIn className="absolute top-3 right-3 w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={cn('flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors', i === selectedImg ? 'border-primary' : 'border-border')}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.is_bestseller && <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">BESTSELLER</span>}
            <h1 className="font-serif text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-muted-foreground line-through text-lg">{formatPrice(product.mrp)}</span>
                  <span className="text-sm font-semibold text-green-600">{discount}% off</span>
                </>
              )}
            </div>
            {product.material && <p className="text-sm text-muted-foreground">Material: <span className="text-foreground font-medium">{product.material}</span></p>}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={cn('px-4 py-2 rounded-lg border text-sm font-medium transition-all', selectedSize === size ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary')}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold">Qty:</p>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted">-</button>
                <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-muted">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={() => toggleWishlist(product)} className={cn('p-3 border rounded-xl transition-colors', wishlisted ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary')}>
                <Heart className={cn('w-5 h-5', wishlisted && 'fill-primary')} />
              </button>
              <button onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }) }} className="p-3 border border-border rounded-xl hover:border-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-sm mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Shipping info */}
            <div className="bg-background rounded-xl p-4 text-sm space-y-1">
              <p className="text-green-600 font-medium">✓ Free shipping on orders above ₹5000</p>
              <p className="text-muted-foreground">✓ Handcrafted & dispatched within 3–5 working days</p>
              <p className="text-muted-foreground">✓ Secure Cashfree payment</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
