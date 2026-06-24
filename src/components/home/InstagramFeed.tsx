import { useCallback, useEffect, useState } from 'react'
import { Instagram, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const REELS = [
  {
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=500&q=80',
    caption: 'Gold Silk Thread Bangles ✨',
  },
  {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
    caption: 'Bridal Kundan Set 👑',
  },
  {
    image: 'https://images.unsplash.com/photo-1583391733956-62a1c35c8c4e?w=500&q=80',
    caption: 'Handcrafted with love 💖',
  },
  {
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&q=80',
    caption: 'Festive Collection 🪔',
  },
  {
    image: 'https://images.unsplash.com/photo-1630299023697-8ec5f3182b5b?w=500&q=80',
    caption: 'Custom Jewellery Orders 💍',
  },
  {
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500&q=80',
    caption: 'Rajwada Heritage Pieces 🌺',
  },
]

export default function InstagramFeed() {
  const { data: settings } = useSiteSettings()
  const igUrl = settings?.instagram_url ?? 'https://instagram.com/meena.rajwada'

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 3500, stopOnInteraction: true })]
  )
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  return (
    <section className="py-14 sm:py-20 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, hsl(345,80%,10%) 0%, hsl(345,60%,16%) 100%)' }}>

      {/* ── Header ── */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        {/* Instagram badge */}
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase mb-5 transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)' }}
        >
          <Instagram className="w-3.5 h-3.5" />
          Follow Us
        </a>

        <h2
          className="text-white text-2xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Join Our{' '}
          <span style={{ background: 'linear-gradient(90deg, #fcb045, #fd1d1d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Insta Story
          </span>
        </h2>

        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          @meena.rajwada
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* ── Carousel ── */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3 sm:gap-4 pl-4 sm:pl-8 lg:pl-16 pr-4">
            {REELS.map((reel, i) => (
              <a
                key={i}
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-[0_0_72vw] sm:flex-[0_0_320px] lg:flex-[0_0_280px] relative rounded-2xl overflow-hidden aspect-[9/16] max-h-[360px] sm:max-h-[400px] bg-black"
              >
                <img
                  src={reel.image}
                  alt={reel.caption}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Instagram icon top right */}
                <div className="absolute top-3 right-3">
                  <Instagram className="w-5 h-5 text-white/80" />
                </div>

                {/* Caption bottom */}
                <p className="absolute bottom-3 left-3 right-3 text-white text-xs sm:text-sm font-medium leading-snug">
                  {reel.caption}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Prev / Next — hidden on small mobile, visible from sm */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="hidden sm:flex absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition-all duration-200 disabled:opacity-30"
          disabled={!canPrev}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="hidden sm:flex absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition-all duration-200 disabled:opacity-30"
          disabled={!canNext}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Swipe hint — mobile only */}
      <p className="text-center text-white/35 text-[10px] tracking-widest uppercase mt-4 sm:hidden">
        ← Swipe to explore →
      </p>

      {/* ── CTA ── */}
      <div className="text-center mt-8 sm:mt-10 px-4">
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-sm border border-white/30 hover:bg-white/10 transition-colors duration-300"
        >
          <Instagram className="w-4 h-4" />
          View All Reels
        </a>
      </div>
    </section>
  )
}
