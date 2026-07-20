import { useCallback } from 'react'
import { Instagram, ChevronLeft, ChevronRight, Heart, Play } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Fallback static posts shown when no DB posts exist yet
const FALLBACK_POSTS = [
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=600&q=85', caption: 'Gold Silk Thread Bangles ✨', tag: 'New Arrival' },
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1610611424854-5f5da64d4fbc?w=600&q=85', caption: 'Bridal Bangle Set 👑', tag: 'Bestseller' },
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1583391733956-62a1c35c8c4e?w=600&q=85', caption: 'Handcrafted with Love 💖', tag: 'Handmade' },
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85', caption: 'Kundan Heritage Set 🌺', tag: 'Heritage' },
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=85', caption: 'Festive Collection 🪔', tag: 'Festive' },
  { reel_id: '', thumbnail_url: 'https://images.unsplash.com/photo-1630299023697-8ec5f3182b5b?w=600&q=85', caption: 'Custom Orders Open 💍', tag: 'Custom' },
]

export default function InstagramFeed() {
  const { data: settings } = useSiteSettings()
  const igUrl = settings?.instagram_url ?? 'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz'

  // Fetch real posts from Supabase
  const { data: dbPosts = [] } = useQuery({
    queryKey: ['instagram-posts-public'],
    queryFn: async () => {
      const { data } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Use DB posts if available, else show fallback
  const posts = (dbPosts as any[]).length > 0
    ? (dbPosts as any[]).map((p: any) => ({
        reel_id: p.reel_id as string,
        thumbnail_url: (p.thumbnail_url as string) ?? '',
        caption: (p.caption as string) ?? '',
        tag: 'Reel',
      }))
    : FALLBACK_POSTS

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 2800, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="py-12 sm:py-16 bg-background overflow-hidden">

      {/* ── Header ── */}
      <div className="text-center mb-8 sm:mb-10 px-4">
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase mb-4 transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)' }}
        >
          <Instagram className="w-3 h-3" />
          Follow @meena.rajwada
        </a>

        <p className="section-label">Our Story</p>
        <h2 className="section-title">Shop Our Latest Drops</h2>
        <div className="divider" />
        <p className="text-xs text-muted-foreground mt-2 tracking-wide">
          Handcrafted jewellery — straight from our workshop to you
        </p>
      </div>

      {/* ── Carousel ── */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3 sm:gap-4 pl-4 sm:pl-8 lg:pl-16 pr-4">
            {posts.map((post, i) => {
              const href = post.reel_id
                ? `https://www.instagram.com/reel/${post.reel_id}/`
                : igUrl
              return (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-[0_0_68vw] sm:flex-[0_0_260px] lg:flex-[0_0_240px] flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Square image / placeholder */}
                  <div className="relative aspect-square overflow-hidden">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.caption}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
                      >
                        <Play className="w-10 h-10 text-white fill-white" />
                        <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Watch Reel</span>
                      </div>
                    )}
                    {/* Tag pill */}
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-primary text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-primary/20">
                      {post.tag}
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <p className="text-xs font-medium text-foreground/80 truncate pr-2 leading-snug">
                      {post.caption || 'View on Instagram'}
                    </p>
                    <Heart className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Prev / Next — desktop only */}
        <button
          onClick={scrollPrev}
          className="hidden sm:flex absolute left-2 lg:left-6 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-border shadow-md items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden sm:flex absolute right-2 lg:right-6 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-border shadow-md items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe hint — mobile only */}
      <p className="sm:hidden text-center text-muted-foreground text-[9px] tracking-[3px] uppercase mt-3">
        ← Swipe to explore →
      </p>

      {/* ── CTA ── */}
      <div className="text-center mt-8 px-4">
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-2.5 text-xs font-bold tracking-widest uppercase border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
        >
          <Instagram className="w-3.5 h-3.5" />
          View on Instagram
        </a>
      </div>

    </section>
  )
}
