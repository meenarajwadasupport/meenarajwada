import SEOHead from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

export default function OurStory() {
  return (
    <>
      <SEOHead title="Our Story" description="The story behind Meena Rajwada — handcrafted jewellery made with love and tradition." url="https://www.meenarajwada.com/our-story" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <p className="section-label">Our Story</p>
          <h1 className="section-title">Crafted with Love, Rooted in Tradition</h1>
          <div className="divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          <div className="rounded-2xl overflow-hidden h-80">
            <img src="https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=600&q=80" alt="Crafting jewellery" className="w-full h-full object-cover" />
          </div>
          <div className="prose prose-sm text-muted-foreground space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Where It All Began</h2>
            <p>Meena Rajwada was born from a deep love for India's rich jewellery-making traditions. What started as a passion for handcrafting beautiful pieces for family and friends grew into a small studio dedicated to creating jewellery that tells stories.</p>
            <p>Every bangle, choker, and earring we create carries within it hours of patient craftsmanship, the finest materials, and a deep reverence for the artisans who have kept these traditions alive for generations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          <div className="prose prose-sm text-muted-foreground space-y-4 lg:order-1 order-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">Our Craft</h2>
            <p>We work with skilled artisans who specialize in kundan setting, meenakari enamel work, and silk thread weaving — techniques passed down through generations. Each piece is made by hand, one at a time, with complete attention to detail.</p>
            <p>We source only the finest materials: genuine silk threads, quality kundan stones, and responsibly sourced metals. Because we believe that what goes into a piece is as important as how it looks.</p>
          </div>
          <div className="rounded-2xl overflow-hidden h-80 lg:order-2 order-1">
            <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80" alt="Our jewellery" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl font-bold mb-3">Ready to Find Your Piece?</h2>
          <p className="text-muted-foreground mb-6">Browse our collection or commission something completely unique.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/shop" className="btn-primary px-8 py-3">Shop Collection</Link>
            <Link to="/customize" className="btn-outline px-8 py-3">Custom Order</Link>
          </div>
        </div>
      </div>
    </>
  )
}
