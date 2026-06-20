import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryGrid() {
  const { data: categories = [] } = useCategories()

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <p className="section-label">Explore</p>
        <h2 className="section-title">Shop by Category</h2>
        <div className="divider" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map(cat => (
          <Link key={cat.id} to={`/category/${cat.slug}`} className="group flex flex-col items-center gap-3">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-shadow">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
