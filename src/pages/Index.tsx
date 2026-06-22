import SEOHead from '@/components/common/SEOHead'
import HeroSlider from '@/components/home/HeroSlider'
import VideoSection from '@/components/home/VideoSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
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

      {/* 1 — Hero with video/image slider */}
      <HeroSlider />

      {/* 2 — 4 product video cards */}
      <VideoSection />

      {/* 3 — Circular category bubbles */}
      <CategoryGrid />

      {/* 4 — Best Sellers / Festival sale grid */}
      <FeaturedProducts />

      {/* 5 — Bridal & Gifting full-width banner */}
      <SpecialMomentsBanner />

      {/* 6 — Bespoke: How Custom Orders Work */}
      <CustomProcess />

      {/* 7 — Hand Crafted / Unique Designs / High Quality */}
      <WhyChooseUs />

      {/* 8 — Art of Handcrafting story section */}
      <ArtOfHandcrafting />

      {/* 9 — Customer testimonials */}
      <Testimonials />

      {/* 10 — Instagram feed */}
      <InstagramFeed />
    </>
  )
}
