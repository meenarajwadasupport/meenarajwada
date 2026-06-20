import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fallbackCategories } from '@/data/categories'
import { Category } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories').select('*').eq('is_active', true).order('display_order')
      if (error || !data?.length) return fallbackCategories
      return data as Category[]
    },
    placeholderData: fallbackCategories,
  })
}
