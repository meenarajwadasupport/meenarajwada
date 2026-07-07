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
            <div key={slide.id} className="relative flex-[0_0_100%] h-[92vh] sm:h-screen min-h-[540px] max-h-[920px]">
              {/* Background — video if available, else image */}
              {slide.video_url ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={slide.image_url}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                >
                  <source src={slide.video_url} type="video/mp4" />
                  {/* Fallback image if video fails */}
                  <img src={slide.image_url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                </video>
              ) : (
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                    idx === selectedIndex ? 'scale-[1.06]' : 'scale-100'
                  }`}
                />
              )}

              {/* Layered cinematic gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />
              <div className={`absolute inset-0 ${
                idx % 2 === 0
                  ? 'bg-gradient-to-r from-black/40 via-transparent to-transparent'
                  : 'bg-gradient-to-l from-black/40 via-transparent to-transparent'
              }`} />
              {/* Subtle brand tint at the bottom for depth */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[hsl(345,80%,10%)]/60 to-transparent" />

              {/* ── Centered hero content ── */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-5 sm:px-8">
                <div className={`w-full max-w-3xl transition-all duration-700 ${
                  idx === selectedIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                  {/* Decorative eyebrow */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                    <span className="block w-10 sm:w-14 h-px bg-gradient-to-r from-transparent to-white/60" />
                    <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.45em] uppercase text-white/80">
                      Meena Rajwada
                    </p>
                    <span className="block w-10 sm:w-14 h-px bg-gradient-to-l from-transparent to-white/60" />
                  </div>

                  {/* Main headline */}
                  <h1
                    className="text-[2.25rem] sm:text-[3.4rem] lg:text-[4.25rem] xl:text-[4.75rem] font-bold text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] whitespace-pre-line"
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                  >
                    {slide.title}
                  </h1>

                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2.5 mt-5">
                    <span className="block w-8 h-px bg-white/40" />
                    <span className="text-gold text-sm drop-shadow">✦</span>
                    <span className="block w-8 h-px bg-white/40" />
                  </div>

                  {slide.subtitle && (
                    <p className="mt-4 sm:mt-5 text-white/85 text-[15px] sm:text-lg leading-relaxed max-w-md sm:max-w-xl mx-auto font-light tracking-wide">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Dual CTA — stacked on mobile, side by side on sm+ */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 mt-8 sm:mt-10">
                    {slide.cta_text && slide.cta_url && (
                      <Link
                        to={slide.cta_url}
                        className="group relative w-full sm:w-auto overflow-hidden bg-white text-primary font-bold px-10 sm:px-12 py-3.5 sm:py-4 text-[11px] tracking-[0.22em] uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative group-hover:text-white transition-colors duration-300">{slide.cta_text}</span>
                      </Link>
                    )}
                    <Link
                      to="/customize"
                      className="group relative w-full sm:w-auto overflow-hidden border border-white/80 text-white font-semibold px-10 sm:px-12 py-3.5 sm:py-4 text-[11px] tracking-[0.22em] uppercase transition-all duration-300 hover:border-white hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-[2px]"
                    >
                      <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative group-hover:text-primary transition-colors duration-300">Customize Yours</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slide number — hidden on mobile */}
              <span className="hidden sm:flex items-center gap-2 absolute bottom-16 right-8 text-white/50 text-xs tracking-[0.3em] font-light">
                <span className="text-white text-sm">{String(idx + 1).padStart(2, '0')}</span>
                <span className="w-6 h-px bg-white/30" />
                {String(slides.length).padStart(2, '0')}
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
            className="hidden sm:flex absolute left-5 lg:left-8 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center bg-white/[0.08] hover:bg-white/25 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/25 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center bg-white/[0.08] hover:bg-white/25 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/25 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  i === selectedIndex ? 'bg-white w-12 shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/35 w-6 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── BOTTOM TICKER STRIP ── */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden flex items-center border-t border-white/10" style={{ height: '30px', background: 'linear-gradient(90deg, #7D1935 0%, #9e2044 50%, #7D1935 100%)' }}>
        <div className="inline-flex whitespace-nowrap animate-marquee" style={{ willChange: 'transform', height: '30px', lineHeight: '30px' }}>
          {[...Array(3)].map((_, rep) =>
            TICKER_ITEMS.map((msg, i) => (
              <span key={`${rep}-${i}`} className="text-white/95 text-[9px] font-medium tracking-[0.28em] uppercase whitespace-nowrap mx-10" style={{ lineHeight: '30px' }}>
                {msg}
              </span>
            ))
          )}
        </div>
      </div>

    </section>
  )
}
