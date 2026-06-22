import { Link } from 'react-router-dom'

// Replace videoUrl with your own uploaded MP4 (Supabase Storage / public/videos/)
// Until then, poster image shows as static thumbnail
const VIDEO_ITEMS = [
  {
    id: 1,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=85&auto=format&fit=crop',
    label: 'Bridal',
    title: 'Bridal Bangle Set',
    price: 'From ₹2,499',
    url: '/category/bridal',
  },
  {
    id: 2,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=85&auto=format&fit=crop',
    label: 'Heritage',
    title: 'Rajwada Heritage',
    price: 'From ₹1,899',
    url: '/category/rajwada-heritage',
  },
  {
    id: 3,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1573408301185-9519f94f9c10?w=700&q=85&auto=format&fit=crop',
    label: 'Custom',
    title: 'Made Just for You',
    price: 'From ₹999',
    url: '/customize',
  },
  {
    id: 4,
    videoUrl: '',
    poster: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=85&auto=format&fit=crop',
    label: 'Festive',
    title: 'Festive Collection',
    price: 'From ₹799',
    url: '/category/festive',
  },
]

export default function VideoSection() {
  return (
    <section className="bg-white py-8 px-4 sm:px-8 lg:px-14">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {VIDEO_ITEMS.map(item => (
          <Link
            key={item.id}
            to={item.url}
            className="group relative block rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300"
          >
            {/* Video / poster — tall portrait ratio like Rosin */}
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={item.poster}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              >
                {item.videoUrl && <source src={item.videoUrl} type="video/mp4" />}
              </video>

              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Label chip */}
              <span className="absolute top-3 left-3 bg-primary/90 text-white text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
                {item.label}
              </span>

              {/* Text inside card */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p
                  className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {item.title}
                </p>
                <p className="text-white/80 text-[11px] mt-1 font-medium">{item.price}</p>
                <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-white border border-white/60 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-primary transition-colors duration-200">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
