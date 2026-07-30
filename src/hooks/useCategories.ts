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
      // If DB is unreachable, use fallback entirely
      if (error) return fallbackCategories
      // If DB returns data, use it — merge fallback image_url only for entries missing one
      if (data?.length) {
        const fallbackMap = new Map(fallbackCategories.map(f => [f.slug, f.image_url]))
        return (data as Category[]).map(cat => ({
          ...cat,
          image_url: cat.image_url || fallbackMap.get(cat.slug) || '',
        }))
      }
      // No categories in DB yet — use fallback
      return fallbackCategories
    },
    placeholderData: fallbackCategories,
  })
}
