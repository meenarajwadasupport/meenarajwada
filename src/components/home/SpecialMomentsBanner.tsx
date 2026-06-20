import { Link } from 'react-router-dom'

export default function SpecialMomentsBanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1583391733956-62a1c35c8c4e?w=1400&q=80"
        alt="Bridal jewellery"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(345,80%,14%)]/80 via-[hsl(345,70%,28%)]/60 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <p className="section-label text-gold-light">Bridal & Gifting</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mt-2">
            Made For Your<br />Special Moments
          </h2>
          <p className="text-white/85 mt-4 text-base leading-relaxed">
            Weddings, anniversaries, baby showers — every milestone deserves a piece crafted with intention and love.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/category/bridal" className="btn-primary px-8 py-3">Bridal Collection</Link>
            <Link to="/category/gifts" className="btn-outline-white px-8 py-3">Gifts</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
