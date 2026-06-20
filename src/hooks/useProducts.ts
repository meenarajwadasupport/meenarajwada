import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fallbackProducts } from '@/data/products'
import { Product } from '@/types'

export function useProducts(options?: { featured?: boolean; category?: string; limit?: number }) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase.from('products').select('*, categories(name,slug)').eq('is_active', true)
      if (options?.featured) query = query.eq('is_featured', true)
      if (options?.category) query = query.eq('category_slug', options.category)
      if (options?.limit) query = query.limit(options.limit)
      query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      if (error || !data?.length) return fallbackProducts
      return data as Product[]
    },
    placeholderData: fallbackProducts,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
      if (error || !data) return fallbackProducts.find(p => p.slug === slug) ?? null
      return data as Product
    },
    enabled: !!slug,
  })
}
