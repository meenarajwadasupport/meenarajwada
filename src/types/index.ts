export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  mrp: number
  material: string
  brand_id?: string
  category_id?: string
  images: string[]
  colors: string[]
  sizes: string[]
  stock: number
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_bestseller: boolean
  is_customizable: boolean
  in_hero_slider: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string
  display_order: number
  is_active: boolean
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed'
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_session_id?: string
  cf_order_id?: string
  tracking_id?: string
  courier?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_full_name: string
  delivery_phone: string
  delivery_address: string
  delivery_city: string
  delivery_state: string
  delivery_pincode: string
  created_at: string
  fulfilled_at?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  color?: string
  size?: string
  image?: string
}

export interface CartItem {
  product: Product
  quantity: number
  color?: string
  size?: string
}

export interface Profile {
  id: string
  full_name: string
  phone?: string
  is_admin: boolean
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
}

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image_url: string
  video_url?: string
  cta_text: string
  cta_url: string
  display_order: number
  is_active: boolean
}

export interface Testimonial {
  id: string
  customer_name: string
  location: string
  review: string
  rating: number
  avatar?: string
  is_active: boolean
  display_order: number
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  author: string
  published_at: string
  is_published: boolean
}
