import { Link } from 'react-router-dom'
import { MessageCircle, Palette, Package, Heart } from 'lucide-react'

const steps = [
  { icon: MessageCircle, number: '01', title: 'Share Your Vision', desc: 'Tell us your dream design, occasion, and colour preferences.' },
  { icon: Palette,       number: '02', title: 'We Design For You', desc: 'Our artisans sketch and refine your custom piece with care.' },
  { icon: Package,       number: '03', title: 'Crafted & Shipped',  desc: 'Hand-crafted with love and delivered safely to your door.' },
  { icon: Heart,         number: '04', title: 'Cherish Forever',    desc: 'A one-of-a-kind piece made to be loved for generations.' },
]

export default function CustomProcess() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 px-4">
          <p className="section-label">Bespoke</p>
          <h2 className="section-title">How Custom Orders Work</h2>
          <div className="divider" />
          <p className="text-muted-foreground max-w-xl mx-auto mt-3 text-sm">
            Every custom piece starts with your story. Here's how we bring it to life.
          </p>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory no-scrollbar">
          {steps.map(({ icon: Icon, number, title, desc }) => (
            <div
              key={number}
              className="flex-[0_0_72vw] snap-start bg-white rounded-2xl p-5 shadow-sm border border-border flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-gold tracking-widest mb-1">{number}</span>
              <h3 className="font-serif text-base font-semibold mb-2 leading-snug">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="sm:hidden text-center text-muted-foreground text-[9px] tracking-[3px] uppercase mt-1 mb-0">
          ← Swipe →
        </p>

        {/* Desktop: 4-col grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 px-6 lg:px-8">
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

        <div className="text-center mt-8 px-4">
          <Link to="/customize" className="btn-primary px-10 py-3">Start Your Custom Order</Link>
        </div>

      </div>
    </section>
  )
}
