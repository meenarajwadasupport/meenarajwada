import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null

  const base = settings.announcement_text
    || 'Handmade with Love  ✦  Customized Just for You  ✦  Pan India Shipping  ✦  Free Shipping on Orders ₹999+'

  return (
    <div className="bg-primary overflow-hidden" style={{ height: '30px' }}>
      <div
        className="animate-marquee"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '30px',
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'white', paddingLeft: '40px', paddingRight: '40px' }}>
          {base}
        </span>
        <span aria-hidden style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'white', paddingLeft: '40px', paddingRight: '40px' }}>
          {base}
        </span>
      </div>
    </div>
  )
}
