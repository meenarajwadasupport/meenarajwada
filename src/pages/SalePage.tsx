import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import SEOHead from '@/components/common/SEOHead'
import { Tag } from 'lucide-react'

function useSaleProducts() {
  return useQuery({
    queryKey: ['sale-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,slug,price,mrp,images,category_slug')
        .eq('is_active', true)
        .not('mrp', 'is', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).filter((p: any) => p.mrp > p.price)
    },
    staleTime: 60_000,
  })
}

export default function SalePage() {
  const { data: products = [], isLoading } = useSaleProducts()
  const [sort, setSort] = useState<'discount' | 'price_asc' | 'price_desc'>('discount')

  const sorted = [...products].sort((a: any, b: any) => {
    if (sort === 'discount') return ((b.mrp - b.price) / b.mrp) - ((a.mrp - a.price) / a.mrp)
    if (sort === 'price_asc') return a.price - b.price
    return b.price - a.price
  })

  return (
    <>
      <SEOHead
        title="Sale — Meena Rajwada"
        description="Grab handcrafted jewellery at special prices. Limited-time offers on bangles, earrings, bridal sets and more."
        url="https://www.meenarajwada.com/sale"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="section-label flex items-center justify-center gap-2"><Tag className="w-3 h-3" /> Limited Offers</p>
          <h1 className="section-title">Sale</h1>
          <div className="divider" />
          <p className="text-muted-foreground mt-3 text-[15px]">Handcrafted jewellery at special prices — while stocks last.</p>
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{products.length} item{products.length !== 1 ? 's' : ''} on sale</p>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white outline-none focus:border-primary"
          >
            <option value="discount">Best Discount</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No sale items right now — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {sorted.map((product: any) => {
              const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
              const img = product.images?.[0]
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Tag className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                    {/* Discount badge */}
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug mb-2">{product.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-primary text-[15px]">{formatPrice(product.price)}</span>
                      <span className="text-muted-foreground text-xs line-through">{formatPrice(product.mrp)}</span>
                      <span className="text-red-500 text-[10px] font-bold">SAVE {formatPrice(product.mrp - product.price)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
