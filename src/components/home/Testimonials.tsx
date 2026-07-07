import { Star } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

export default function Testimonials() {
  const { data: testimonials = [] } = useTestimonials()

  return (
    <section className="py-16 sm:py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-9 sm:mb-12 px-4">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2">Love Notes</p>
          <h2
            className="text-[26px] sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2.5 mt-3.5">
            <span className="block w-10 h-px bg-primary/25" />
            <span className="text-primary/50 text-[11px]">✦</span>
            <span className="block w-10 h-px bg-primary/25" />
          </div>
        </div>

        {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
        <div className="md:hidden flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="relative flex-[0_0_82vw] snap-start bg-white rounded-2xl p-6 pt-7 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/60"
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-2 right-5 text-[64px] leading-none text-primary/[0.08] select-none pointer-events-none"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                &ldquo;
              </span>

              <div className="flex gap-1 mb-3.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed italic mb-5">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                {t.avatar && (
                  <img src={t.avatar} alt={t.customer_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/10" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{t.customer_name}</p>
                  {t.location && <p className="text-[11px] text-muted-foreground tracking-wide">{t.location}</p>}
                </div>
                <span className="ml-auto text-[9px] font-bold tracking-[0.15em] uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Swipe hint — mobile */}
        <p className="md:hidden text-center text-muted-foreground/70 text-[10px] tracking-[0.25em] uppercase mt-1 mb-0">
          ← Swipe →
        </p>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-7 px-6 lg:px-8">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="group relative bg-white rounded-2xl p-7 pt-8 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.14)] hover:border-primary/20"
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-3 right-6 text-[76px] leading-none text-primary/[0.07] group-hover:text-primary/[0.12] transition-colors duration-300 select-none pointer-events-none"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                &ldquo;
              </span>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-[15px] text-foreground/80 leading-relaxed italic mb-6">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                {t.avatar && (
                  <img src={t.avatar} alt={t.customer_name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/10" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{t.customer_name}</p>
                  {t.location && <p className="text-[11px] text-muted-foreground tracking-wide">{t.location}</p>}
                </div>
                <span className="ml-auto text-[9px] font-bold tracking-[0.15em] uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">Verified</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
