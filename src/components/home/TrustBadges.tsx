import { ShieldCheck, Truck, RefreshCw, Gem } from 'lucide-react'

const badges = [
  { icon: Gem, label: 'Handcrafted Quality', desc: 'Each piece made with care' },
  { icon: Truck, label: 'Free Shipping ₹5000+', desc: 'Pan India delivery' },
  { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: ShieldCheck, label: 'Secure Payments', desc: '100% safe & encrypted' },
]

export default function TrustBadges() {
  return (
    <section className="bg-[#FAF7F5] border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {badges.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className={`group flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2.5 sm:gap-4 px-4 sm:px-7 py-6 sm:py-7 transition-colors duration-300 hover:bg-white
                ${i % 2 === 1 ? 'border-l border-border/60' : ''}
                ${i >= 2 ? 'border-t lg:border-t-0 border-border/60' : ''}
                ${i >= 1 ? 'lg:border-l lg:border-border/60' : ''}`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/[0.08] ring-1 ring-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:ring-primary group-hover:scale-105">
                <Icon className="w-[22px] h-[22px] text-primary transition-colors duration-300 group-hover:text-white" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-[13px] sm:text-sm font-bold text-foreground leading-tight tracking-wide">{label}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
