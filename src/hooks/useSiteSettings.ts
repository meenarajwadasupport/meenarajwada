import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cfGetSiteSettings, hasCfWorker } from '@/lib/cfApi'

export interface SiteSettings {
  announcement_text:   string
  announcement_active: boolean
  whatsapp_number:     string
  email_address:       string
  store_address:       string
  business_hours:      string
  instagram_url:       string
  facebook_url:        string
  youtube_url:         string
  pinterest_url:       string
}

const defaultSettings: SiteSettings = {
  announcement_text:   'Handmade with Love  |  Customized Just for You  |  Pan India Shipping',
  announcement_active: true,
  whatsapp_number:     '916304424767',
  email_address:       '',
  store_address:       '',
  business_hours:      'Mon–Sat: 10am–7pm',
  instagram_url:       'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz',
  facebook_url:        '',
  youtube_url:         '',
  pinterest_url:       '',
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<SiteSettings> => {
      if (hasCfWorker()) {
        try {
          const data = await cfGetSiteSettings()
          if (Object.keys(data).length) {
            return {
              ...defaultSettings,
              ...data,
              announcement_active: data.announcement_active === 'true' || (data.announcement_active as unknown) === true,
            }
          }
        } catch { /* fall through */ }
      }

      const { data: rows, error } = await supabase.from('site_settings').select('*').limit(1)
      if (error || !rows?.length) return defaultSettings
      return { ...defaultSettings, ...rows[0] } as SiteSettings
    },
    placeholderData: defaultSettings,
  })
}
