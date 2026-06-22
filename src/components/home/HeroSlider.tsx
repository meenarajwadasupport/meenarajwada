import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroSlides } from '@/hooks/useHeroSlides'

export default function HeroSlider() {
  const { data: slides = [] } = useHeroSlides()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })])
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
          {slides.map(slide => (
            <div key={slide.id} className="relative flex-[0_0_100%] h-[88vh] min-h-[580px]">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

              {/* Slide content — vertically centered */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-xl">
                    <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/70 mb-4">
                      Handcrafted with Love
                    </p>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-white leading-[1.1] whitespace-pre-line drop-shadow-lg">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="mt-5 text-white/85 text-base sm:text-lg leading-relaxed max-w-md">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.cta_text && slide.cta_url && (
                      <Link
                        to={slide.cta_url}
                        className="inline-block mt-9 bg-white text-primary hover:bg-primary hover:text-white font-semibold px-10 py-3.5 text-[11px] tracking-[0.18em] uppercase transition-all duration-300 shadow-lg hover:shadow-xl">
                        {slide.cta_text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-5 top-1/2 -translate-y-1/2 p-2.5 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'bg-white w-8' : 'bg-white/40 w-4'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── MARQUEE TICKER at bottom of hero ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-sm overflow-hidden h-9 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-white text-[11px] font-semibold tracking-[0.2em] uppercase mx-8">
              Must check size chart before ordering &nbsp;—&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
