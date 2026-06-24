import { Scissors, Sparkles, Gem } from 'lucide-react'

const features = [
  {
    icon: Scissors,
    title: 'Hand Crafted',
    desc: 'Timeless handmade jewellery that transcends fashion fads.',
  },
  {
    icon: Sparkles,
    title: 'Unique Designs',
    desc: 'Bespoke creations that reflect your personal style.',
  },
  {
    icon: Gem,
    title: 'High Quality',
    desc: 'Finest materials — beautiful, durable, long-lasting.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-14 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-10">

        {/* Always 3-col — compact on mobile, spacious on desktop */}
        <div className="grid grid-cols-3 gap-3 sm:gap-8 text-center">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center">
              {/* Icon circle */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-[11px] sm:text-base font-bold text-foreground mb-1 sm:mb-2 leading-tight">{title}</h3>
              <p className="hidden sm:block text-sm text-foreground/60 leading-relaxed max-w-[220px]">{desc}</p>
              {/* Mobile: short version */}
              <p className="sm:hidden text-[9px] text-foreground/55 leading-snug px-1">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
