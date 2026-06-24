import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const base = settings.announcement_text
    || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'

  return (
    <div className="bg-primary text-white py-2 overflow-hidden">
      {/* Two copies side by side; animation moves left by exactly 50% for seamless loop */}
      <div className="flex min-w-max animate-marquee">
        {[0, 1].map(i => (
          <span
            key={i}
            aria-hidden={i === 1}
            className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap px-8"
          >
            {base}
          </span>
        ))}
      </div>
    </div>
  )
}
