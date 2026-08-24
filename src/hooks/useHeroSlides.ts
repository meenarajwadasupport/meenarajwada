import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cfGetHeroSlides, hasCfWorker } from '@/lib/cfApi'
import { fallbackHeroSlides } from '@/data/heroSlides'
import { HeroSlide } from '@/types'

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<HeroSlide[]> => {
      if (hasCfWorker()) {
        try {
          const data = await cfGetHeroSlides()
          if (data?.length) return data as unknown as HeroSlide[]
        } catch { /* fall through */ }
      }

      const { data, error } = await supabase
        .from('hero_slides').select('*').eq('is_active', true).order('display_order')
      if (error || !data?.length) return fallbackHeroSlides
      return data as HeroSlide[]
    },
    placeholderData: fallbackHeroSlides,
  })
}
