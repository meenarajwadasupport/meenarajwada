import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const base = settings.announcement_text
    || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'

  return (
    <div className="bg-primary overflow-hidden" style={{ height: '28px' }}>
      {/* line-height = container height centres text reliably on all mobile browsers */}
      <div
        className="inline-flex whitespace-nowrap animate-marquee"
        style={{ willChange: 'transform', height: '28px', lineHeight: '28px' }}
      >
        <span
          className="text-white text-[9px] font-medium tracking-[0.18em] uppercase whitespace-nowrap px-10"
          style={{ lineHeight: '28px' }}
        >
          {base}
        </span>
        <span
          aria-hidden
          className="text-white text-[9px] font-medium tracking-[0.18em] uppercase whitespace-nowrap px-10"
          style={{ lineHeight: '28px' }}
        >
          {base}
        </span>
      </div>
    </div>
  )
}
