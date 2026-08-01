import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

function useCraftImages() {
  return useQuery({
    queryKey: ['site-settings'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: rows } = await supabase.from('site_settings').select('craft_image_1,craft_image_2,craft_image_3,craft_image_4').limit(1)
      return rows?.[0] ?? {}
    },
  })
}

function CraftMedia({ src, alt, className }: { src?: string; alt: string; className: string }) {
  if (!src) {
    return (
      <div className={`${className} bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center`}>
        <span className="text-2xl opacity-40">💎</span>
      </div>
    )
  }
  const isGif = /\.gif(\?|$)/i.test(src)
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(src)
  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay muted loop playsInline
        className={`${className} object-cover`}
      />
    )
  }
  return <img src={src} alt={alt} loading="lazy" className={`${className} object-cover`} />
}

export default function ArtOfHandcrafting() {
  const { data: imgs = {} } = useCraftImages()
  const imgClass = 'w-full h-full'

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="section-label">Our Craft</p>
            <h2 className="section-title text-left mt-2">The Art of Handcrafting</h2>
            <div className="w-16 h-0.5 bg-gold mt-4 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every piece of Meena Rajwada jewellery is a labour of love. Our artisans spend hours meticulously hand-setting stones, weaving silk threads, and shaping metal into beautiful adornments.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We source only the finest materials — pure silk threads, quality kundan stones, and responsibly sourced metals — to ensure that each creation is as durable as it is beautiful.
            </p>
            <Link to="/our-story" className="btn-outline px-8 py-3">Our Story</Link>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden h-48 bg-muted">
                <CraftMedia src={(imgs as any).craft_image_1} alt="Handcrafting 1" className={imgClass} />
              </div>
              <div className="rounded-2xl overflow-hidden h-32 bg-muted">
                <CraftMedia src={(imgs as any).craft_image_2} alt="Handcrafting 2" className={imgClass} />
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="rounded-2xl overflow-hidden h-32 bg-muted">
                <CraftMedia src={(imgs as any).craft_image_3} alt="Handcrafting 3" className={imgClass} />
              </div>
              <div className="rounded-2xl overflow-hidden h-48 bg-muted">
                <CraftMedia src={(imgs as any).craft_image_4} alt="Handcrafting 4" className={imgClass} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
