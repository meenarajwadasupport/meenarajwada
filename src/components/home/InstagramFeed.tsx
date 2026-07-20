import { useEffect, useRef, useState } from 'react'
import { Instagram, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function InstagramFeed() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [embedsLoaded, setEmbedsLoaded] = useState(false)
  const { data: settings } = useSiteSettings()
  const igUrl = settings?.instagram_url ?? 'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz'

  // Fetch active reels from DB
  const { data: posts = [], isLoading } = useQuery({
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

  const reelIds = (posts as any[]).map((p: any) => p.reel_id as string)

  // Load Instagram embed.js — same technique as Helmet Hub
  useEffect(() => {
    if (reelIds.length === 0) return

    const existing = document.querySelector('script[src*="instagram.com/embed.js"]')
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      setTimeout(() => {
        if ((window as any).instgrm) {
          ;(window as any).instgrm.Embeds.process()
          setEmbedsLoaded(true)
        }
      }, 300)
    }

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [reelIds.length])

  // Re-process when reels change
  useEffect(() => {
    if ((window as any).instgrm && reelIds.length > 0) {
      setTimeout(() => (window as any).instgrm.Embeds.process(), 100)
    }
  }, [reelIds])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amt = window.innerWidth < 640 ? 290 : 340
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' })
  }

  if (isLoading) return null
  if (reelIds.length === 0) return null   // hide section entirely if no reels added yet

  return (
    <section className="py-12 sm:py-16 bg-background overflow-hidden relative">

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

      {/* ── Scrollable Reel Embeds ── */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Arrows */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20 px-2 sm:px-4">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-6 sm:px-16 py-4"
        >
          {reelIds.map((reelId, i) => (
            <div
              key={reelId}
              className="ig-reel-card flex-shrink-0 w-[260px] sm:w-[300px] md:w-[320px] aspect-[9/16] overflow-hidden relative rounded-2xl border border-border/40 shadow-xl bg-black transition-transform duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Loading placeholder */}
              {!embedsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}>
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 animate-pulse">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                  <p className="text-white/80 text-xs font-semibold tracking-wide">Loading reel…</p>
                </div>
              )}

              {/* Official Instagram embed */}
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/`}
                data-instgrm-version="14"
                style={{ background: 'transparent', border: 0, margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}
              >
                <a href={`https://www.instagram.com/reel/${reelId}/`} target="_blank" rel="noopener noreferrer" className="block w-full h-full" />
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* Swipe hint */}
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

      {/* CSS: clip bottom of embed to hide Instagram chrome (same trick as Helmet Hub) */}
      <style>{`
        .ig-reel-card {
          position: relative;
          overflow: hidden;
          clip-path: inset(0 0 160px 0);
        }
        @media (min-width: 640px) {
          .ig-reel-card {
            clip-path: inset(0 0 200px 0);
          }
        }
        .ig-reel-card iframe {
          position: absolute !important;
          top: -50px !important;
          left: -1px !important;
          width: calc(100% + 2px) !important;
          height: calc(100% + 260px) !important;
          border: 0 !important;
        }
        @media (min-width: 640px) {
          .ig-reel-card iframe {
            top: -70px !important;
            height: calc(100% + 340px) !important;
          }
        }
        .ig-reel-card .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
          background: transparent !important;
        }
      `}</style>
    </section>
  )
}
