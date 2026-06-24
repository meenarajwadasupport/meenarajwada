import { Star } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

export default function Testimonials() {
  const { data: testimonials = [] } = useTestimonials()

  return (
    <section className="py-14 sm:py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 px-4">
          <p className="section-label">Love Notes</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="divider" />
        </div>

        {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
        <div className="md:hidden flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="flex-[0_0_82vw] snap-start bg-white rounded-2xl p-5 shadow-sm border border-border"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed italic mb-4">"{t.review}"</p>
              <div className="flex items-center gap-2.5">
                {t.avatar && (
                  <img src={t.avatar} alt={t.customer_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">{t.customer_name}</p>
                  {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Swipe hint — mobile */}
        <p className="md:hidden text-center text-muted-foreground text-[10px] tracking-widest uppercase mt-1 mb-0">
          ← Swipe →
        </p>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 px-6 lg:px-8">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic mb-5">"{t.review}"</p>
              <div className="flex items-center gap-3">
                {t.avatar && (
                  <img src={t.avatar} alt={t.customer_name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold">{t.customer_name}</p>
                  {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
