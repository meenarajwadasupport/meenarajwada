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

      {/* ── Page banner ── */}
      <div className="bg-gradient-to-b from-[#FAF7F5] to-white border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2">The Collection</p>
          <h1 className="font-serif text-3xl sm:text-[42px] font-bold text-foreground leading-tight">All Jewellery</h1>
          <div className="flex items-center justify-center gap-2.5 mt-3">
            <span className="block w-10 h-px bg-primary/25" />
            <span className="text-primary/50 text-[11px]">✦</span>
            <span className="block w-10 h-px bg-primary/25" />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-3">
            {sorted.length} handcrafted {sorted.length === 1 ? 'piece' : 'pieces'}, made with love
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Filter / sort toolbar ── */}
        <div className="sticky top-16 lg:top-[76px] z-20 -mx-4 sm:mx-0 px-4 sm:px-5 py-3.5 mb-8 bg-white/95 backdrop-blur-md sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)] border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">

            {/* Price filter */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/[0.07] flex items-center justify-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Max Price</span>
                  <span className="text-xs font-bold text-primary tabular-nums">₹{maxPrice.toLocaleString('en-IN')}{maxPrice === 15000 ? '+' : ''}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={15000}
                  step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
              {maxPrice < 15000 && (
                <button
                  onClick={() => setMaxPrice(15000)}
                  className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-primary border border-border hover:border-primary/40 rounded-full px-2.5 py-1.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Divider */}
            <span className="hidden sm:block w-px h-9 bg-border" />

            {/* Sort */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground whitespace-nowrap">Sort by</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="flex-1 sm:flex-none text-[13px] font-medium border border-border rounded-full pl-4 pr-8 py-2 bg-white outline-none focus:border-primary hover:border-primary/40 transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!isLoading && sorted.length === 0 ? (
          <div className="text-center py-20 sm:py-28">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/[0.07] flex items-center justify-center mb-5">
              <SlidersHorizontal className="w-6 h-6 text-primary/60" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No pieces found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Nothing matches your current filter. Try increasing the price range to see more of our collection.
            </p>
            <button
              onClick={() => setMaxPrice(15000)}
              className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.18em]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <ProductGrid products={sorted} loading={isLoading} />
        )}
      </div>
    </>
  )
}
