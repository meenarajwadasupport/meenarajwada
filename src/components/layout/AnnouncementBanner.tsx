import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null
  return (
    <div className="bg-primary text-white text-center py-2 px-4">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase">
        {settings.announcement_text || 'Handmade with Love  |  Customized Just for You  |  Pan India Shipping'}
      </p>
    </div>
  )
}
