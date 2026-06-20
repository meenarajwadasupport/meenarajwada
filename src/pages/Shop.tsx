import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/product/ProductGrid'
import SEOHead from '@/components/common/SEOHead'
import { SlidersHorizontal, X } from 'lucide-react'
import { Product } from '@/types'

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
]

export default function Shop() {
  const { data: products = [], isLoading } = useProducts()
  const [sort, setSort] = useState('default')
  const [maxPrice, setMaxPrice] = useState(10000)

  const sorted = [...products]
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    }) as Product[]

  return (
    <>
      <SEOHead title="Shop All Jewellery" description="Browse our full collection of handcrafted bangles, bridal jewellery, and custom pieces." url="https://www.meenarajwada.com/shop" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">All Jewellery</h1>
            <p className="text-muted-foreground text-sm mt-1">{sorted.length} pieces</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Sort:</label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 items-center mb-6">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Max price: ₹{maxPrice.toLocaleString('en-IN')}</span>
          <input type="range" min={500} max={15000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-36 accent-primary" />
          {maxPrice < 15000 && (
            <button onClick={() => setMaxPrice(15000)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><X className="w-3 h-3" />Clear</button>
          )}
        </div>

        <ProductGrid products={sorted} loading={isLoading} />
      </div>
    </>
  )
}
