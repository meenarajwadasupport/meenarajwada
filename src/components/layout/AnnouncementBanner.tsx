import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function AnnouncementBanner() {
  const { data: settings } = useSiteSettings()
  if (!settings?.announcement_active) return null
  return (
    <div className="bg-primary text-white text-center py-2 px-4 text-sm font-medium tracking-wide">
      {settings.announcement_text}
    </div>
  )
}
