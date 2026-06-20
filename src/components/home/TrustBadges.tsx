import { ShieldCheck, Truck, RefreshCw, Gem } from 'lucide-react'

const badges = [
  { icon: Gem, label: 'Handcrafted Quality', desc: 'Each piece made with care' },
  { icon: Truck, label: 'Free Shipping ₹5000+', desc: 'Pan India delivery' },
  { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: ShieldCheck, label: 'Secure Payments', desc: '100% safe & encrypted' },
]

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {badges.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
