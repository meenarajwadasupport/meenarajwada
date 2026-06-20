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
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map(slide => (
            <div key={slide.id} className="relative flex-[0_0_100%] h-[70vh] min-h-[500px] max-h-[700px]">
              <img src={slide.image_url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-lg">
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-pre-line drop-shadow-lg">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="mt-4 text-white/90 text-base sm:text-lg leading-relaxed max-w-md">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.cta_text && slide.cta_url && (
                      <Link to={slide.cta_url} className="inline-block mt-8 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3.5 rounded-full text-sm tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
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

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => emblaApi?.scrollNext()} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'bg-white w-6' : 'bg-white/50 w-3'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
