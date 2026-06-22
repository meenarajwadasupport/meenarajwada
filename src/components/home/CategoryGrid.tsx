import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryGrid() {
  const { data: categories = [] } = useCategories()

  return (
    <section className="py-14 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">

        {/* Heading — exactly like reference: centered, bold, uppercase spaced */}
        <h2 className="text-center text-lg sm:text-xl font-bold tracking-[0.28em] uppercase text-foreground mb-10">
          Shop by Category
        </h2>

        {/* 2 rows × 6 columns = 12 circles */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-8 gap-x-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              {/* Circle */}
              <div className="relative w-[108px] h-[108px] sm:w-[120px] sm:h-[120px] lg:w-[130px] lg:h-[130px] rounded-full overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  style={{ transform: 'scale(1)', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              {/* Label */}
              <span className="text-[12px] sm:text-[13px] font-normal text-center text-foreground/80 group-hover:text-primary transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
