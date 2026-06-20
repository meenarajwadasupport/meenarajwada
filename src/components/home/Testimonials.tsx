import { Star } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

export default function Testimonials() {
  const { data: testimonials = [] } = useTestimonials()

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="section-label">Love Notes</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="divider" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic mb-5">"{t.review}"</p>
              <div className="flex items-center gap-3">
                {t.avatar && <img src={t.avatar} alt={t.customer_name} className="w-10 h-10 rounded-full object-cover" />}
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
