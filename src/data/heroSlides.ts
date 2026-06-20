import { HeroSlide } from '@/types'

export const fallbackHeroSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Handcrafted Heritage.\nCustomized For Every Story.',
    subtitle: 'Handmade Bangles, Jewelry & more. Customized with Love for You.',
    image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=1400&q=80',
    cta_text: 'Explore Collections',
    cta_url: '/shop',
    display_order: 1,
    is_active: true,
  },
  {
    id: '2',
    title: 'Made For Your\nSpecial Moments.',
    subtitle: 'Bridal, Festive or Everyday — We craft moments you\'ll cherish forever.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-62a1c35c8c4e?w=1400&q=80',
    cta_text: 'Bridal Collection',
    cta_url: '/category/bridal',
    display_order: 2,
    is_active: true,
  },
  {
    id: '3',
    title: 'Your Vision.\nOur Craftsmanship.',
    subtitle: 'Create a one-of-a-kind piece designed just for you.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80',
    cta_text: 'Customize Your Design',
    cta_url: '/customize',
    display_order: 3,
    is_active: true,
  },
]
