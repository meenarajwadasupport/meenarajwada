import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const text = settings.announcement_text || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'
  // Duplicate for seamless loop
  const ticker = `${text}  ✦  ${text}  ✦  `

  return (
    <div className="bg-primary text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase inline-block pr-8">
          {ticker}
        </span>
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase inline-block pr-8" aria-hidden>
          {ticker}
        </span>
      </div>
    </div>
  )
}
