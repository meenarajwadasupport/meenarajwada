import { Product } from '@/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
