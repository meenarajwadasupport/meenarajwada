import { Link } from 'react-router-dom'

// ── Replace videoUrl with your uploaded MP4 links (Supabase Storage / public folder)
// ── Until then the poster image shows as a static thumbnail
const VIDEO_ITEMS = [
  {
    id: 1,
    videoUrl: '',   // e.g. '/videos/bridal-set.mp4' or Supabase public URL
    poster: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop',
    title: 'Bridal Bangle Set',
    subtitle: 'Full Bridal Collection',
    price: '₹2,499',
    url: '/category/bridal',
  },
  {
    id: 2,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80&auto=format&fit=crop',
    title: 'Rajwada Heritage',
    subtitle: 'Traditional Handcrafted',
    price: '₹1,899',
    url: '/category/rajwada-heritage',
  },
  {
    id: 3,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80&auto=format&fit=crop',
    title: 'Festive Collection',
    subtitle: 'Customised Just for You',
    price: '₹999',
    url: '/category/festive',
  },
]

export default function VideoSection() {
  return (
    <section className="bg-background py-10 px-4 sm:px-8 lg:px-16">
      {/* Section heading */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-primary mb-2">
          Watch &amp; Shop
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Crafted to Perfection
        </h2>
      </div>

      {/* Video card grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        {VIDEO_ITEMS.map(item => (
          <Link key={item.id} to={item.url} className="group block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            {/* Video / poster */}
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={item.poster}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              >
                {item.videoUrl && <source src={item.videoUrl} type="video/mp4" />}
              </video>
              {/* Gradient at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Price badge */}
              <span className="absolute bottom-3 left-3 bg-white text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                {item.price}
              </span>
            </div>

            {/* Card footer */}
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{item.subtitle}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {item.title}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                Shop
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
