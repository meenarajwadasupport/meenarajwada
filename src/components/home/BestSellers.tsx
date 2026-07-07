import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'

export default function BestSellers() {
  const { data: products = [] } = useProducts({ featured: true, limit: 8 })

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-[#FAF7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2">Our Picks</p>
          <h2
            className="text-[26px] sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Best Sellers
          </h2>
          <div className="flex items-center justify-center gap-2.5 mt-3.5">
            <span className="block w-10 h-px bg-primary/25" />
            <span className="text-primary/50 text-[11px]">✦</span>
            <span className="block w-10 h-px bg-primary/25" />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-3 max-w-md mx-auto">
            The pieces our customers keep coming back for — handcrafted, one at a time.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-11 sm:mt-14">
          <Link
            to="/shop"
            className="group relative inline-flex items-center gap-2 overflow-hidden border border-primary text-primary font-bold px-10 py-3.5 text-[11px] tracking-[0.22em] uppercase transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative group-hover:text-white transition-colors duration-300">View All Jewellery</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
