import { Instagram } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

// Placeholder feed — replace with actual Instagram Basic Display API if needed
const placeholderImages = [
  'https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=300&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80',
  'https://images.unsplash.com/photo-1583391733956-62a1c35c8c4e?w=300&q=80',
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=300&q=80',
  'https://images.unsplash.com/photo-1630299023697-8ec5f3182b5b?w=300&q=80',
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&q=80',
]

export default function InstagramFeed() {
  const { data: settings } = useSiteSettings()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="section-label">Follow Along</p>
          <h2 className="section-title">@meenarajwada</h2>
          <div className="divider" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {placeholderImages.map((src, i) => (
            <a key={i} href={settings?.instagram_url ?? '#'} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={src} alt={`Instagram ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 flex items-center justify-center transition-all duration-300">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href={settings?.instagram_url ?? 'https://instagram.com/meenarajwada'} target="_blank" rel="noopener noreferrer" className="btn-outline px-8 py-3 inline-flex items-center gap-2">
            <Instagram className="w-4 h-4" /> Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
