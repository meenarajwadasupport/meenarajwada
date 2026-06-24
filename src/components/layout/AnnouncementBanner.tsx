import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const base = settings.announcement_text
    || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'

  return (
    <div className="bg-primary text-white overflow-hidden flex items-center" style={{ height: '26px' }}>
      {/* Fixed height, vertically centred, GPU-accelerated marquee */}
      <div className="inline-flex whitespace-nowrap animate-marquee" style={{ willChange: 'transform' }}>
        <span className="text-[9px] font-medium tracking-[0.18em] uppercase whitespace-nowrap px-10">
          {base}
        </span>
        <span aria-hidden className="text-[9px] font-medium tracking-[0.18em] uppercase whitespace-nowrap px-10">
          {base}
        </span>
      </div>
    </div>
  )
}
