import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cfGetCategories, hasCfWorker } from '@/lib/cfApi'
import { fallbackCategories } from '@/data/categories'
import { Category } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Category[]> => {
      if (hasCfWorker()) {
        try {
          const data = await cfGetCategories()
          if (data?.length) {
            const fallbackMap = new Map(fallbackCategories.map(f => [f.slug, f.image_url]))
            return (data as unknown as Category[]).map(cat => ({
              ...cat,
              image_url: cat.image_url || fallbackMap.get(cat.slug) || '',
            }))
          }
        } catch { /* fall through */ }
      }

      const { data, error } = await supabase
        .from('categories').select('id,name,slug,image_url,display_order,is_active,parent_id')
        .eq('is_active', true).order('display_order')
      if (error) return fallbackCategories
      if (data?.length) {
        const fallbackMap = new Map(fallbackCategories.map(f => [f.slug, f.image_url]))
        return (data as Category[]).map(cat => ({
          ...cat,
          image_url: cat.image_url || fallbackMap.get(cat.slug) || '',
        }))
      }
      return fallbackCategories
    },
    placeholderData: fallbackCategories,
  })
}
