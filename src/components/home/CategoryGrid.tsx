import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryGrid() {
  const { data: categories = [] } = useCategories()

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold tracking-[0.38em] uppercase text-primary mb-2">
            Collections
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Shop by Category
          </h2>
          <div className="mt-3 mx-auto w-12 h-[2px] bg-primary/40 rounded-full" />
        </div>

        {/* Circular grid */}
        <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-x-3 gap-y-7">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5"
            >
              {/* Circle image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-[88px] lg:h-[88px] rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-sm group-hover:shadow-md">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-300 rounded-full" />
              </div>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-medium text-center text-foreground/75 group-hover:text-primary transition-colors leading-tight max-w-[72px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
