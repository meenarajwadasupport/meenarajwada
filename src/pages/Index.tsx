import SEOHead from '@/components/common/SEOHead'
import HeroSlider from '@/components/home/HeroSlider'
import VideoSection from '@/components/home/VideoSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BestSellers from '@/components/home/BestSellers'
import CustomProcess from '@/components/home/CustomProcess'
import SpecialMomentsBanner from '@/components/home/SpecialMomentsBanner'
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
      <HeroSlider />
      <VideoSection />
      <CategoryGrid />
      <FeaturedProducts />
      <BestSellers />
      <CustomProcess />
      <SpecialMomentsBanner />
      <ArtOfHandcrafting />
      <Testimonials />
      <InstagramFeed />
    </>
  )
}
