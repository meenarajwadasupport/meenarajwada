import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryGrid() {
  const { data: categories = [] } = useCategories()

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-[#FAF7F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-10">

        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2">Curated for You</p>
          <h2
            className="text-[26px] sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Shop by Category
          </h2>
          <div className="flex items-center justify-center gap-2.5 mt-3.5">
            <span className="block w-10 h-px bg-primary/25" />
            <span className="text-primary/50 text-[11px]">✦</span>
            <span className="block w-10 h-px bg-primary/25" />
          </div>
        </div>

        {/* Mobile: 4 cols | SM+: 6 cols */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-7 gap-x-2 sm:gap-x-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5"
            >
              {/* Circle with gold ring on hover — pure CSS, no JS events */}
              <div className="relative rounded-full p-[3px] bg-gradient-to-br from-border/60 via-transparent to-border/60 group-hover:from-primary group-hover:via-gold group-hover:to-primary transition-all duration-500">
                <div className="relative rounded-full overflow-hidden flex-shrink-0 bg-muted shadow-sm group-hover:shadow-xl group-hover:shadow-primary/15 transition-shadow duration-500
                  w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] lg:w-[118px] lg:h-[118px] ring-2 ring-white">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Soft dark overlay on hover for depth */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-500" />
                  {/* Shine sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out" />
                </div>
              </div>
              <span className="text-[10px] sm:text-[11.5px] lg:text-[12.5px] font-semibold text-center text-foreground/70 group-hover:text-primary transition-colors duration-300 leading-tight max-w-[76px] sm:max-w-none tracking-wide">
                {cat.name}
              </span>
              <span className="hidden sm:block w-0 group-hover:w-6 h-px bg-primary/60 transition-all duration-300 -mt-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
