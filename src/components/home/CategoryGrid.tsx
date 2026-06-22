import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryGrid() {
  const { data: categories = [] } = useCategories()

  return (
    <section className="py-12 sm:py-14 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-10">

        <h2 className="text-center text-base sm:text-lg font-bold tracking-[0.28em] uppercase text-foreground mb-8 sm:mb-10">
          Shop by Category
        </h2>

        {/* Mobile: 4 cols | SM+: 6 cols — 2 rows of 6 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-6 gap-x-2 sm:gap-x-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              {/* Circle — pure CSS hover, no JS events */}
              <div className="relative rounded-full overflow-hidden flex-shrink-0 shadow-sm
                w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] lg:w-[118px] lg:h-[118px]
                border-2 border-transparent group-hover:border-primary transition-all duration-300">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-center text-foreground/75 group-hover:text-primary transition-colors leading-tight max-w-[76px] sm:max-w-none">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
