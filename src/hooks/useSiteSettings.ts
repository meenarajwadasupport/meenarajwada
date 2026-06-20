import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface SiteSettings {
  announcement_text: string
  announcement_active: boolean
  whatsapp_number: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  pinterest_url: string
}

const defaultSettings: SiteSettings = {
  announcement_text: 'Handmade with Love  |  Customized Just for You  |  Pan India Shipping',
  announcement_active: true,
  whatsapp_number: '919876543210',
  instagram_url: 'https://instagram.com/meenarajwada',
  facebook_url: 'https://facebook.com/meenarajwada',
  youtube_url: '',
  pinterest_url: '',
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle()
      if (error || !data) return defaultSettings
      return data as SiteSettings
    },
    placeholderData: defaultSettings,
    staleTime: 10 * 60 * 1000,
  })
}
