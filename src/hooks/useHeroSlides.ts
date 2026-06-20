import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fallbackHeroSlides } from '@/data/heroSlides'
import { HeroSlide } from '@/types'

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides').select('*').eq('is_active', true).order('display_order')
      if (error || !data?.length) return fallbackHeroSlides
      return data as HeroSlide[]
    },
    placeholderData: fallbackHeroSlides,
  })
}
