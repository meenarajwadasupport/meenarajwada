import { useRef } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Fallback used if DB table doesn't exist yet or returns nothing
const FALLBACK_ITEMS = [
  { id: 1, label: 'Bridal',   title: 'Bridal Bangle Set',  price: 'From ₹2,499', url: '/category/bridal',           image_url: '', video_url: '' },
  { id: 2, label: 'Heritage', title: 'Rajwada Heritage',    price: 'From ₹1,899', url: '/category/rajwada-heritage', image_url: '', video_url: '' },
  { id: 3, label: 'Custom',   title: 'Made Just for You',   price: 'From ₹999',   url: '/customize',                 image_url: '', video_url: '' },
  { id: 4, label: 'Festive',  title: 'Festive Collection',  price: 'From ₹799',   url: '/category/festive',          image_url: '', video_url: '' },
]

function useCollections() {
  return useQuery({
    queryKey: ['featured-collections'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      if (error || !data?.length) return FALLBACK_ITEMS
      return data
    },
  })
}

function CollectionCard({ item }: { item: any }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasVideo = !!item.video_url
  const hasImage = !!item.image_url
  const isGif = hasVideo && /\.gif(\?|$)/i.test(item.video_url)

  return (
    <Link
      to={item.url ?? '/shop'}
      className="group relative block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">

        {/* Media layer — video > gif > image > placeholder */}
        {hasVideo && !isGif ? (
          <video
            ref={videoRef}
            src={item.video_url}
            autoPlay muted loop playsInline
            poster={item.image_url || undefined}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : isGif ? (
          <img
            src={item.video_url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : hasImage ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          /* Placeholder when no image or video uploaded yet */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-3xl mb-2">💎</span>
            <p className="text-xs text-primary/60 font-medium text-center px-3">{item.title}</p>
            <p className="text-[9px] text-primary/40 mt-1">Add photo in Admin → Collections</p>
          </div>
        )}

        {/* Gradient overlay */}
        {(hasImage || hasVideo) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        )}

        {/* Label chip */}
        {item.label && (
          <span className="absolute top-3 left-3 bg-white/90 text-primary text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border border-primary/20 backdrop-blur-sm">
            {item.label}
          </span>
        )}

        {/* Text */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 ${!hasImage && !hasVideo ? 'relative' : ''}`}>
          <p
            className="text-white font-semibold text-sm sm:text-base leading-tight drop-shadow"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {item.title}
          </p>
          {item.price && (
            <p className="text-white/80 text-[11px] mt-0.5 font-medium drop-shadow">{item.price}</p>
          )}
          <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-white border border-white/50 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-primary transition-colors duration-200 backdrop-blur-sm">
            Shop Now
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function VideoSection() {
  const { data: items = FALLBACK_ITEMS } = useCollections()

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  if (!items.length) return null

  return (
    <section className="bg-white py-6 sm:py-8">

      {/* Mobile: horizontal scroll carousel */}
      <div className="sm:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3 pl-4 pr-2">
            {items.map((item: any) => (
              <div key={item.id} className="flex-[0_0_72vw] flex-shrink-0">
                <CollectionCard item={item} />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-muted-foreground text-[9px] tracking-[3px] uppercase mt-3">← Swipe →</p>
      </div>

      {/* Desktop: 4-col grid */}
      <div className="hidden sm:block max-w-7xl mx-auto px-8 lg:px-14">
        <div className="grid grid-cols-4 gap-3 lg:gap-4">
          {items.map((item: any) => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </div>
      </div>

    </section>
  )
}
