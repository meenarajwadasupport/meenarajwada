import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import ProductGrid from '@/components/product/ProductGrid'
import SEOHead from '@/components/common/SEOHead'

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  return (
    <>
      <SEOHead title="My Wishlist" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground mb-8">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
        {wishlist.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Heart className="w-14 h-14 text-muted-foreground/40" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <Link to="/shop" className="btn-primary px-8 py-3">Discover Jewellery</Link>
          </div>
        ) : (
          <ProductGrid products={wishlist} />
        )}
      </div>
    </>
  )
}
