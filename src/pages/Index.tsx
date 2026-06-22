import SEOHead from '@/components/common/SEOHead'
import HeroSlider from '@/components/home/HeroSlider'
import VideoSection from '@/components/home/VideoSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import OurPickBestSeller from '@/components/home/OurPickBestSeller'
import SpecialMomentsBanner from '@/components/home/SpecialMomentsBanner'
import CustomProcess from '@/components/home/CustomProcess'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import ArtOfHandcrafting from '@/components/home/ArtOfHandcrafting'
import Testimonials from '@/components/home/Testimonials'
import InstagramFeed from '@/components/home/InstagramFeed'

export default function Index() {
  return (
    <>
      <SEOHead
        title="Meena Rajwada – Handcrafted Jewellery"
        description="Explore exquisite handmade bangles, bridal jewellery, and custom pieces crafted with love. Shop Meena Rajwada's artisanal collection."
        url="https://www.meenarajwada.com"
      />

      {/* 1 */}
      <HeroSlider />

      {/* 2 */}
      <VideoSection />

      {/* 3 */}
      <CategoryGrid />

      {/* 4 — Handcrafted for You / Best Sellers */}
      <FeaturedProducts />

      {/* 5 — Our Pick / Best Seller (8 cards, Add to Cart) */}
      <OurPickBestSeller />

      {/* 6 — Bridal & Gifting */}
      <SpecialMomentsBanner />

      {/* 7 — Bespoke: How Custom Orders Work */}
      <CustomProcess />

      {/* 8 — Art of Handcrafting */}
      <ArtOfHandcrafting />

      {/* 9 — Testimonials */}
      <Testimonials />

      {/* 10 — Instagram feed */}
      <InstagramFeed />

      {/* 11 — Hand Crafted / Unique Designs / High Quality — very last */}
      <WhyChooseUs />
    </>
  )
}
