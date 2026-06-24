import { Scissors, Sparkles, Gem } from 'lucide-react'

const features = [
  {
    icon: Scissors,
    title: 'Hand Crafted',
    desc: 'Every piece is made by hand with love — timeless artistry that no machine can replicate.',
  },
  {
    icon: Sparkles,
    title: 'Unique Designs',
    desc: 'Bespoke creations built around you — your style, your story, your jewellery.',
  },
  {
    icon: Gem,
    title: 'High Quality',
    desc: 'Only the finest materials used — beautiful, durable, and made to be cherished forever.',
  },
]

export default function WhyChooseUs() {
  return (
    <section
      className="py-12 sm:py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(345,70%,97%) 0%, hsl(30,40%,96%) 50%, hsl(43,55%,96%) 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <p className="section-label">Why Us</p>
        <h2 className="section-title">The Meena Rajwada Promise</h2>
        <div className="divider" />
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex-[0_0_72vw] flex-shrink-0 bg-white rounded-2xl p-5 shadow-sm border border-border/60 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-base font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <p className="sm:hidden text-center text-muted-foreground text-[9px] tracking-[3px] uppercase mt-3">
        ← Swipe →
      </p>

      {/* Desktop: 3-col grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto px-8 lg:px-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-7 shadow-sm border border-border/60 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
