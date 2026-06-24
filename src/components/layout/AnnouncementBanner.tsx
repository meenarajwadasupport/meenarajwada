import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const base = settings.announcement_text
    || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'

  return (
    <div className="bg-primary text-white py-1.5 overflow-hidden">
      {/* Two copies side by side; animation moves left by exactly 50% — inline-flex + will-change for mobile GPU */}
      <div className="inline-flex whitespace-nowrap animate-marquee" style={{ willChange: 'transform' }}>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap px-10">
          {base}
        </span>
        <span aria-hidden className="text-[10px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap px-10">
          {base}
        </span>
      </div>
    </div>
  )
}
