export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  mrp: number
  material: string
  category_id?: string
  category_slug?: string
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
  order_number?: string       // e.g. MR-10001
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address?: {
    address: string
    city: string
    state: string
    pincode: string
  }
  subtotal: number
  shipping_amount: number
  total_amount: number
  status: string
  payment_status: string
  cashfree_order_id?: string
  tracking_id?: string
  courier?: string
  email_sent?: boolean        // prevents duplicate dispatch emails
  created_at: string
  updated_at?: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  size?: string
  quantity: number
  price: number
}

export interface CartItem {
  product_id: string
  product?: Product
  size: string
  quantity: number
  price: number
}

export interface Profile {
  id: string
  full_name: string
  email?: string
  phone?: string
  is_admin: boolean
  avatar_url?: string
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
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
  location?: string
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
  excerpt?: string
  content?: string
  cover_image?: string
  is_published: boolean
  created_at: string
}
