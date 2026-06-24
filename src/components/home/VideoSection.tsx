import { useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Replace videoUrl with your own uploaded MP4 (Supabase Storage / public/videos/)
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

function VideoCard({ item }: { item: typeof VIDEO_ITEMS[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <Link
      to={item.url}
      className="group relative block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={item.poster}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        >
          {item.videoUrl && <source src={item.videoUrl} type="video/mp4" />}
        </video>

        {/* Lighter gradient — only bottom third */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Label chip */}
        <span className="absolute top-3 left-3 bg-white/90 text-primary text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border border-primary/20">
          {item.label}
        </span>

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p
            className="text-white font-semibold text-sm sm:text-base leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {item.title}
          </p>
          <p className="text-white/75 text-[11px] mt-0.5 font-medium">{item.price}</p>
          <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-white border border-white/50 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-primary transition-colors duration-200">
            Shop Now
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function VideoSection() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  return (
    <section className="bg-white py-6 sm:py-8">

      {/* Mobile: Embla horizontal carousel */}
      <div className="sm:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3 pl-4 pr-2">
            {VIDEO_ITEMS.map(item => (
              <div
                key={item.id}
                className="flex-[0_0_72vw] flex-shrink-0"
              >
                <VideoCard item={item} />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-muted-foreground text-[9px] tracking-[3px] uppercase mt-3">
          ← Swipe →
        </p>
      </div>

      {/* Desktop: 4-col grid */}
      <div className="hidden sm:block max-w-7xl mx-auto px-8 lg:px-14">
        <div className="grid grid-cols-4 gap-3 lg:gap-4">
          {VIDEO_ITEMS.map(item => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>

    </section>
  )
}
