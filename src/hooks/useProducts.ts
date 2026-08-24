import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cfGetProducts, cfGetProduct, hasCfWorker } from '@/lib/cfApi'
import { fallbackProducts } from '@/data/products'
import { Product } from '@/types'

export function useProducts(options?: { featured?: boolean; bestseller?: boolean; category?: string; sale?: boolean; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['products', options],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Product[]> => {
      // ── Cloudflare Worker (primary) ──────────────────────────────────────
      if (hasCfWorker()) {
        try {
          const params: Record<string, string> = {}
          if (options?.featured)   params.featured   = '1'
          if (options?.bestseller) params.bestseller = '1'
          if (options?.sale)       params.sale       = '1'
          if (options?.category)   params.category   = options.category
          if (options?.search)     params.search     = options.search
          if (options?.limit)      params.limit      = String(options.limit)
          const data = await cfGetProducts(params)
          if (data?.length) return data as unknown as Product[]
        } catch { /* fall through to Supabase */ }
      }

      // ── Supabase fallback ────────────────────────────────────────────────
      let query = supabase.from('products').select('*').eq('is_active', true)
      if (options?.featured)   query = query.eq('is_featured', true)
      if (options?.bestseller) query = query.eq('is_bestseller', true)
      if (options?.category)   query = query.eq('category_slug', options.category)
      if (options?.sale)       query = query.not('mrp', 'is', null)
      if (options?.search)     query = query.ilike('name', `%${options.search}%`)
      if (options?.limit)      query = query.limit(options.limit)
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
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Product | null> => {
      if (hasCfWorker()) {
        try {
          const data = await cfGetProduct(slug)
          if (data) return data as unknown as Product
        } catch { /* fall through */ }
      }
      const { data, error } = await supabase
        .from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
      if (error || !data) return fallbackProducts.find(p => p.slug === slug) ?? null
      return data as Product
    },
    enabled: !!slug,
  })
}
