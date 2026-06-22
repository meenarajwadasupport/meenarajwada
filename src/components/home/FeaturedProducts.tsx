import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'

export default function FeaturedProducts() {
  const { data: products = [] } = useProducts({ featured: true, limit: 4 })

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">

        {/* Header row — title left, View All right */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.38em] uppercase text-primary mb-1">
              Handpicked for You
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1 whitespace-nowrap"
          >
            View All <span className="text-base">{'>>'}</span>
          </Link>
        </div>

        {/* 4-card product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.slice(0, 4).map(product => {
            const discount = product.mrp > product.price
              ? Math.round((1 - product.price / product.mrp) * 100)
              : 0

            return (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="group block"
              >
                {/* Image container */}
                <div className="relative rounded-xl overflow-hidden aspect-square bg-muted mb-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount badge */}
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                      -{discount}%
                    </span>
                  )}

                  {/* New badge */}
                  {product.is_new_arrival && discount === 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                      New
                    </span>
                  )}

                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                    <span className="bg-white text-primary text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Product info */}
                <div className="px-0.5">
                  <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-primary font-bold text-sm">
                      {'₹'}{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-muted-foreground text-xs line-through">
                        {'₹'}{product.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
