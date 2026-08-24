import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cfGetTestimonials, hasCfWorker } from '@/lib/cfApi'

export interface Testimonial {
  id: string
  name: string
  location?: string
  rating: number
  review: string
  avatar_url?: string | null
  is_active?: boolean | number
  sort_order?: number
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Testimonial[]> => {
      if (hasCfWorker()) {
        try {
          const data = await cfGetTestimonials()
          if (data?.length) return data as Testimonial[]
        } catch { /* fall through */ }
      }

      const { data, error } = await supabase
        .from('testimonials').select('*').eq('is_active', true).order('sort_order')
      if (error || !data?.length) return []
      return data as Testimonial[]
    },
    placeholderData: [],
  })
}
