import { Link } from 'react-router-dom'

export default function ArtOfHandcrafting() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="section-label">Our Craft</p>
            <h2 className="section-title text-left mt-2">The Art of Handcrafting</h2>
            <div className="w-16 h-0.5 bg-gold mt-4 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every piece of Meena Rajwada jewellery is a labour of love. Our artisans spend hours meticulously hand-setting stones, weaving silk threads, and shaping metal into beautiful adornments.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We source only the finest materials — pure silk threads, quality kundan stones, and responsibly sourced metals — to ensure that each creation is as durable as it is beautiful.
            </p>
            <Link to="/our-story" className="btn-outline px-8 py-3">Our Story</Link>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden h-48 bg-muted">
                <img src="https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=400&q=80" alt="Handcrafting 1" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-32 bg-muted">
                <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80" alt="Handcrafting 2" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="rounded-2xl overflow-hidden h-32 bg-muted">
                <img src="https://images.unsplash.com/photo-1630299023697-8ec5f3182b5b?w=400&q=80" alt="Handcrafting 3" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-48 bg-muted">
                <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80" alt="Handcrafting 4" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
