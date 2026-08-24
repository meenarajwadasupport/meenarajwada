/**
 * Cloudflare Worker API client
 *
 * All public catalog reads (products, categories, hero slides, etc.) go
 * through the Worker → D1 (edge, zero Supabase bandwidth).
 *
 * Admin writes also go through the Worker so catalog data never touches
 * Supabase (protecting the free-tier 2 GB bandwidth limit).
 *
 * Set VITE_CF_WORKER_URL in Vercel Environment Variables:
 *   https://meenarajwada-api.<subdomain>.workers.dev
 */

const BASE = (import.meta.env.VITE_CF_WORKER_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** Returns true when the Worker URL is configured. */
export const hasCfWorker = () => Boolean(BASE)

async function cfFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) throw new Error(`CF API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ─── Public reads ─────────────────────────────────────────────────────────────

export interface CFProduct {
  id: string
  slug: string
  name: string
  description: string
  price: number
  mrp: number | null
  category_slug: string | null
  images: string[]
  colors: string[]
  sizes: string[]
  tags: string[]
  is_active: number
  is_featured: number
  is_bestseller: number
  stock: number
  created_at: string
  updated_at: string
}

export interface CFCategory {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  is_active: number
  sort_order: number
}

export interface CFHeroSlide {
  id: string
  title: string
  subtitle: string
  image_url: string
  cta_text: string
  cta_link: string
  is_active: number
  sort_order: number
}

export interface CFSiteSettings { [key: string]: string }

export interface CFTestimonial {
  id: string
  name: string
  location: string
  rating: number
  review: string
  avatar_url: string | null
  is_active: number
  sort_order: number
}

export interface CFFeaturedCollection {
  id: string
  title: string
  subtitle: string
  image_url: string
  link: string
  badge: string | null
  is_active: number
  sort_order: number
}

export interface CFBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author: string
  status: string
  published_at: string | null
}

export interface CFFAQ {
  id: string
  question: string
  answer: string
  is_active: number
  sort_order: number
}

export interface CFNavCollection {
  id: string
  label: string
  slug: string
  image_url: string | null
  sort_order: number
}

export interface CFInstagramPost {
  id: string
  image_url: string
  link: string | null
  is_active: number
  sort_order: number
}

export interface CFFeaturedPromo {
  id: string
  title: string
  subtitle: string
  image_url: string
  link: string
  badge: string | null
  is_active: number
  sort_order: number
}

// Products
export const cfGetProducts = (params: Record<string, string> = {}) => {
  const q = new URLSearchParams(params).toString()
  return cfFetch<CFProduct[]>(`/catalog/products${q ? '?' + q : ''}`)
}
export const cfGetProduct = (slug: string) =>
  cfFetch<CFProduct>(`/catalog/products/${slug}`)

// Categories
export const cfGetCategories = () => cfFetch<CFCategory[]>('/catalog/categories')

// Hero slides
export const cfGetHeroSlides = () => cfFetch<CFHeroSlide[]>('/catalog/hero-slides')

// Featured collections
export const cfGetFeaturedCollections = () =>
  cfFetch<CFFeaturedCollection[]>('/catalog/featured-collections')

// Blog posts
export const cfGetBlogPosts = () => cfFetch<CFBlogPost[]>('/catalog/blog-posts')
export const cfGetBlogPost  = (slug: string) =>
  cfFetch<CFBlogPost>(`/catalog/blog-posts/${slug}`)

// FAQs
export const cfGetFaqs = () => cfFetch<CFFAQ[]>('/catalog/faqs')

// Testimonials
export const cfGetTestimonials = () => cfFetch<CFTestimonial[]>('/catalog/testimonials')

// Instagram posts
export const cfGetInstagramPosts = () =>
  cfFetch<CFInstagramPost[]>('/catalog/instagram-posts')

// Nav collections
export const cfGetNavCollections = () =>
  cfFetch<CFNavCollection[]>('/catalog/nav-collections')

// Site settings
export const cfGetSiteSettings = () => cfFetch<CFSiteSettings>('/catalog/site-settings')

// Featured promos
export const cfGetFeaturedPromos = () =>
  cfFetch<CFFeaturedPromo[]>('/catalog/featured-promos')

// ─── Admin writes ─────────────────────────────────────────────────────────────

function adminFetch<T>(path: string, method: string, token: string, body?: unknown) {
  return cfFetch<T>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// Image upload to R2 — accepts a File or pre-compressed Blob
export async function cfUploadImage(
  file: File | Blob,
  folder: string,
  token: string,
  filename?: string,  // override filename; defaults to UUID
): Promise<string> {
  const ext = filename?.split('.').pop()
    ?? (file instanceof File ? file.name.split('.').pop() : null)
    ?? 'webp'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`
  const contentType = file.type || 'image/webp'
  const res = await fetch(`${BASE}/media/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${token}`,
    },
    body: file,
  })
  if (!res.ok) throw new Error('R2 upload failed')
  const data = await res.json() as { url: string }
  return data.url
}

// Products CRUD
export const cfCreateProduct = (data: unknown, token: string) =>
  adminFetch('/admin/products', 'POST', token, data)
export const cfUpdateProduct = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/products/${id}`, 'PUT', token, data)
export const cfDeleteProduct = (id: string, token: string) =>
  adminFetch(`/admin/products/${id}`, 'DELETE', token)

// Categories CRUD
export const cfCreateCategory = (data: unknown, token: string) =>
  adminFetch('/admin/categories', 'POST', token, data)
export const cfUpdateCategory = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/categories/${id}`, 'PUT', token, data)
export const cfDeleteCategory = (id: string, token: string) =>
  adminFetch(`/admin/categories/${id}`, 'DELETE', token)

// Hero slides CRUD
export const cfCreateHeroSlide = (data: unknown, token: string) =>
  adminFetch('/admin/hero-slides', 'POST', token, data)
export const cfUpdateHeroSlide = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/hero-slides/${id}`, 'PUT', token, data)
export const cfDeleteHeroSlide = (id: string, token: string) =>
  adminFetch(`/admin/hero-slides/${id}`, 'DELETE', token)

// Featured collections CRUD
export const cfCreateFeaturedCollection = (data: unknown, token: string) =>
  adminFetch('/admin/featured-collections', 'POST', token, data)
export const cfUpdateFeaturedCollection = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/featured-collections/${id}`, 'PUT', token, data)
export const cfDeleteFeaturedCollection = (id: string, token: string) =>
  adminFetch(`/admin/featured-collections/${id}`, 'DELETE', token)

// Blog posts CRUD
export const cfCreateBlogPost = (data: unknown, token: string) =>
  adminFetch('/admin/blog-posts', 'POST', token, data)
export const cfUpdateBlogPost = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/blog-posts/${id}`, 'PUT', token, data)
export const cfDeleteBlogPost = (id: string, token: string) =>
  adminFetch(`/admin/blog-posts/${id}`, 'DELETE', token)

// FAQs CRUD
export const cfCreateFaq = (data: unknown, token: string) =>
  adminFetch('/admin/faqs', 'POST', token, data)
export const cfUpdateFaq = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/faqs/${id}`, 'PUT', token, data)
export const cfDeleteFaq = (id: string, token: string) =>
  adminFetch(`/admin/faqs/${id}`, 'DELETE', token)

// Testimonials CRUD
export const cfCreateTestimonial = (data: unknown, token: string) =>
  adminFetch('/admin/testimonials', 'POST', token, data)
export const cfUpdateTestimonial = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/testimonials/${id}`, 'PUT', token, data)
export const cfDeleteTestimonial = (id: string, token: string) =>
  adminFetch(`/admin/testimonials/${id}`, 'DELETE', token)

// Instagram posts CRUD
export const cfCreateInstagramPost = (data: unknown, token: string) =>
  adminFetch('/admin/instagram-posts', 'POST', token, data)
export const cfUpdateInstagramPost = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/instagram-posts/${id}`, 'PUT', token, data)
export const cfDeleteInstagramPost = (id: string, token: string) =>
  adminFetch(`/admin/instagram-posts/${id}`, 'DELETE', token)

// Nav collections CRUD
export const cfCreateNavCollection = (data: unknown, token: string) =>
  adminFetch('/admin/nav-collections', 'POST', token, data)
export const cfUpdateNavCollection = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/nav-collections/${id}`, 'PUT', token, data)
export const cfDeleteNavCollection = (id: string, token: string) =>
  adminFetch(`/admin/nav-collections/${id}`, 'DELETE', token)

// Site settings (bulk upsert)
export const cfUpdateSiteSettings = (data: Record<string, string>, token: string) =>
  adminFetch('/admin/site-settings', 'PUT', token, data)

// Featured promos CRUD
export const cfCreateFeaturedPromo = (data: unknown, token: string) =>
  adminFetch('/admin/featured-promos', 'POST', token, data)
export const cfUpdateFeaturedPromo = (id: string, data: unknown, token: string) =>
  adminFetch(`/admin/featured-promos/${id}`, 'PUT', token, data)
export const cfDeleteFeaturedPromo = (id: string, token: string) =>
  adminFetch(`/admin/featured-promos/${id}`, 'DELETE', token)
