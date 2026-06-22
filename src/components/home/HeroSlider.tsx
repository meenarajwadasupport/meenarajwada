import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroSlides } from '@/hooks/useHeroSlides'

// Marquee messages — unique, not copied from any reference
const TICKER_ITEMS = [
  '✦ Please check size chart before placing your order',
  '✦ Handcrafted with love — each piece is unique',
  '✦ Custom orders delivered in 7–10 days',
  '✦ Pan India shipping available',
  '✦ 100% handmade jewellery',
]

export default function HeroSlider() {
  const { data: slides = [] } = useHeroSlides()
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  if (!slides.length) return null

  return (
    <section className="relative overflow-hidden -mt-[76px]">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="relative flex-[0_0_100%] h-screen min-h-[640px] max-h-[900px]">
              {/* Background image */}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />

              {/* Gradient — varies by slide for visual interest */}
              <div className={`absolute inset-0 ${
                idx % 2 === 0
                  ? 'bg-gradient-to-r from-black/65 via-black/35 to-black/10'
                  : 'bg-gradient-to-b from-black/20 via-black/40 to-black/70'
              }`} />

              {/* ── Centered hero content ── */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div className="max-w-2xl">
                  {/* Decorative top line */}
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <span className="block w-12 h-[1px] bg-white/50" />
                    <p className="text-[10px] font-semibold tracking-[0.45em] uppercase text-white/75">
                      Meena Rajwada
                    </p>
                    <span className="block w-12 h-[1px] bg-white/50" />
                  </div>

                  {/* Main headline */}
                  <h1
                    className="text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-bold text-white leading-[1.05] drop-shadow-xl whitespace-pre-line"
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                  >
                    {slide.title}
                  </h1>

                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <span className="block w-6 h-[1px] bg-white/40" />
                    <span className="text-white/50 text-xs">✦</span>
                    <span className="block w-6 h-[1px] bg-white/40" />
                  </div>

                  {slide.subtitle && (
                    <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-lg mx-auto font-light">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Dual CTA */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-9">
                    {slide.cta_text && slide.cta_url && (
                      <Link
                        to={slide.cta_url}
                        className="bg-white text-primary hover:bg-primary hover:text-white font-bold px-10 py-3.5 text-[11px] tracking-[0.22em] uppercase transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {slide.cta_text}
                      </Link>
                    )}
                    <Link
                      to="/customize"
                      className="border border-white text-white hover:bg-white hover:text-primary font-semibold px-10 py-3.5 text-[11px] tracking-[0.22em] uppercase transition-all duration-300"
                    >
                      Customize Yours
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slide number — bottom right */}
              <span className="absolute bottom-16 right-6 text-white/40 text-xs tracking-widest font-light">
                {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition-all duration-200 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition-all duration-200 border border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-[2px] rounded-full transition-all duration-400 ${
                  i === selectedIndex ? 'bg-white w-10' : 'bg-white/35 w-5'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── MARQUEE TICKER — unique style (gold/cream, different from Rosin) ── */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-9 flex items-center"
        style={{ background: 'linear-gradient(90deg, #7D1935 0%, #9e2044 50%, #7D1935 100%)' }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, rep) =>
            TICKER_ITEMS.map((msg, i) => (
              <span
                key={`${rep}-${i}`}
                className="text-white/90 text-[10px] font-medium tracking-[0.25em] uppercase mx-10"
              >
                {msg}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
