import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fallbackTestimonials } from '@/data/testimonials'
import { Testimonial } from '@/types'

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials').select('*').eq('is_active', true).order('display_order')
      if (error || !data?.length) return fallbackTestimonials
      return data as Testimonial[]
    },
    placeholderData: fallbackTestimonials,
  })
}
