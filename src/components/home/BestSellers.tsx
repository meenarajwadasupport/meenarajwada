import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'

export default function BestSellers() {
  const { data: products = [] } = useProducts({ featured: true, limit: 8 })

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="section-label">Our Picks</p>
          <h2 className="section-title">Best Sellers</h2>
          <div className="divider" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/shop" className="btn-outline px-8 py-3">View All Jewellery</Link>
        </div>
      </div>
    </section>
  )
}
