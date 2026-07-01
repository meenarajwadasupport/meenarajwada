import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

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
  whatsapp_number:     '',
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
    queryFn: async () => {
      // Use limit(1) to safely handle tables with 0 or multiple rows
      const { data: rows, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
      if (error || !rows?.length) return defaultSettings
      return { ...defaultSettings, ...rows[0] } as SiteSettings
    },
    placeholderData: defaultSettings,
    staleTime: 10 * 60 * 1000,
  })
}
