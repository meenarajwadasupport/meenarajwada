import { Link } from 'react-router-dom'
import { MessageCircle, Palette, Package, Heart } from 'lucide-react'

const steps = [
  { icon: MessageCircle, number: '01', title: 'Share Your Vision', desc: 'Tell us your dream design, occasion, and colour preferences.' },
  { icon: Palette, number: '02', title: 'We Design For You', desc: 'Our artisans sketch and refine your custom piece with care.' },
  { icon: Package, number: '03', title: 'Crafted & Shipped', desc: 'Hand-crafted with love and delivered safely to your door.' },
  { icon: Heart, number: '04', title: 'Cherish Forever', desc: 'A one-of-a-kind piece made to be loved for generations.' },
]

export default function CustomProcess() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="section-label">Bespoke</p>
          <h2 className="section-title">How Custom Orders Work</h2>
          <div className="divider" />
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-sm">Every custom piece starts with your story. Here's how we bring it to life.</p>
        </div>

        {/* 4 steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, number, title, desc }) => (
            <div key={number} className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-gold tracking-widest">{number}</span>
              <h3 className="font-serif text-lg font-semibold mt-1 mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/customize" className="btn-primary px-10 py-3">Start Your Custom Order</Link>
        </div>

      </div>
    </section>
  )
}
