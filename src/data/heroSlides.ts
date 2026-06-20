import { HeroSlide } from '@/types'

export const fallbackHeroSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Handcrafted Heritage.\nCustomized For Every Story.',
    subtitle: 'Handmade Bangles, Jewelry & more. Customized with Love for You.',
    image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=90&auto=format&fit=crop',
    cta_text: 'Explore Collections',
    cta_url: '/shop',
    display_order: 1,
    is_active: true,
  },
  {
    id: '2',
    title: 'Made For Your\nSpecial Moments.',
    subtitle: 'Bridal, Festive or Everyday — We craft moments you\'ll cherish forever.',
    image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&q=90&auto=format&fit=crop',
    cta_text: 'Bridal Collection',
    cta_url: '/category/bridal',
    display_order: 2,
    is_active: true,
  },
  {
    id: '3',
    title: 'Your Vision.\nOur Craftsmanship.',
    subtitle: 'Create a one-of-a-kind piece designed just for you.',
    image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1600&q=90&auto=format&fit=crop',
    cta_text: 'Customize Your Design',
    cta_url: '/customize',
    display_order: 3,
    is_active: true,
  },
]
