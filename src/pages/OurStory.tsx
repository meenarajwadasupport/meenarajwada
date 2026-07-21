import SEOHead from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

const VALUES = [
  {
    number: '01',
    title: 'Made by Hand',
    body: 'Every piece leaves our studio only when it meets the exacting standard our artisans have held for decades. No shortcuts, no compromises.',
  },
  {
    number: '02',
    title: 'Rooted in Tradition',
    body: 'Kundan setting, meenakari enamel work, silk thread weaving — techniques passed down through generations, kept alive in every order we make.',
  },
  {
    number: '03',
    title: 'Made for You',
    body: 'We work on a pre-order model, which means your piece is crafted fresh for you — not pulled off a shelf. That is the Rajwada difference.',
  },
  {
    number: '04',
    title: 'Honest Materials',
    body: 'We source genuine silk threads, quality kundan stones, and responsibly handled metals. What goes inside a piece matters as much as how it looks.',
  },
]

const MILESTONES = [
  { year: 'The Beginning', text: 'What started as handcrafting pieces for family and close friends grew into something we could not keep to ourselves.' },
  { year: 'The Studio', text: 'A small, dedicated workspace where skilled artisans bring each design to life — one piece at a time, with full attention to detail.' },
  { year: 'Pan-India', text: 'From our studio to doorsteps across every state in India. Handcrafted jewellery, now reachable everywhere.' },
  { year: 'Custom Orders', text: 'We opened our doors to bespoke commissions — because the best jewellery is the kind made with your story in mind.' },
]

export default function OurStory() {
  return (
    <>
      <SEOHead
        title="Our Story"
        description="The story behind Meena Rajwada — handcrafted jewellery made with love and tradition."
        url="https://www.meenarajwada.com/our-story"
      />

      {/* ── Editorial header ── */}
      <div className="bg-[#FAF7F5] border-b border-[#ece3dc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-14 sm:pt-22 sm:pb-20">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-4">Our Story</p>
          <h1 className="font-serif text-[42px] sm:text-[64px] lg:text-[72px] font-bold text-[#1a0a08] leading-[1.05] max-w-3xl">
            Crafted with<br />Love, Rooted<br />in Tradition
          </h1>
          <div className="flex items-center gap-3 mt-6 mb-8">
            <span className="w-12 h-px bg-[#7D1935]/30" />
            <span className="text-[#7D1935]/50 text-sm">✦</span>
            <span className="w-12 h-px bg-[#7D1935]/30" />
          </div>
        </div>
      </div>

      {/* ── Opening pull-quote ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="font-serif text-[22px] sm:text-[30px] text-[#1a0a08] leading-[1.5] font-medium">
            "Meena Rajwada was born from a deep love for India's rich jewellery-making traditions. What began as a passion for handcrafting pieces for family grew into a studio dedicated to jewellery that carries meaning."
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-px bg-[#7D1935]/40" />
            <p className="text-[12px] font-bold tracking-[0.25em] uppercase text-[#7D1935]/70">Meena Rajwada, Founder</p>
          </div>
        </div>
      </div>

      {/* ── Story sections ── */}
      <div className="border-t border-[#ece3dc]">
        {/* Section 1 */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_24px_64px_-16px_rgba(125,25,53,0.15)]">
                <img
                  src="https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=800&q=85"
                  alt="Artisan crafting jewellery"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating label */}
              <div className="absolute -bottom-5 -right-3 sm:right-6 bg-white border border-[#ece3dc] rounded-2xl px-5 py-4 shadow-lg">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#9a8880]">Every piece</p>
                <p className="font-serif text-[18px] font-bold text-[#1a0a08] leading-tight">Made by hand</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-4">Where It All Began</p>
              <h2 className="font-serif text-[32px] sm:text-[40px] font-bold text-[#1a0a08] leading-tight mb-6">
                A passion that<br />became a purpose
              </h2>
              <div className="space-y-5 text-[15px] text-[#6b5a55] leading-[1.8]">
                <p>
                  Every bangle, choker, and earring we create carries within it hours of patient craftsmanship, the finest materials, and a deep reverence for the artisans who have kept these traditions alive for generations.
                </p>
                <p>
                  We were never trying to build a mass-market brand. We were trying to make something that felt like it mattered — jewellery with a soul, made for occasions that deserve nothing less.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 — reversed */}
        <div className="bg-[#FAF7F5] border-y border-[#ece3dc]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="lg:order-2 relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_24px_64px_-16px_rgba(125,25,53,0.15)]">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=85"
                    alt="Handcrafted jewellery collection"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:order-1">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-4">Our Craft</p>
                <h2 className="font-serif text-[32px] sm:text-[40px] font-bold text-[#1a0a08] leading-tight mb-6">
                  Techniques that<br />outlast trends
                </h2>
                <div className="space-y-5 text-[15px] text-[#6b5a55] leading-[1.8]">
                  <p>
                    We work with skilled artisans who specialise in kundan setting, meenakari enamel work, and silk thread weaving. These are not styles — they are living traditions, each one requiring years of practice to master.
                  </p>
                  <p>
                    We source only genuine silk threads, quality kundan stones, and responsibly handled metals. Because we believe that what goes into a piece is as important as how it looks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Our values ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-3">What We Stand For</p>
          <h2 className="font-serif text-[32px] sm:text-[44px] font-bold text-[#1a0a08]">The Rajwada Way</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#ece3dc]">
          {VALUES.map(({ number, title, body }) => (
            <div key={number} className="bg-white p-8 sm:p-10 hover:bg-[#FAF7F5] transition-colors duration-300">
              <p className="font-serif text-[48px] font-bold text-[#7D1935]/12 leading-none mb-4 select-none">{number}</p>
              <h3 className="font-serif text-[20px] font-bold text-[#1a0a08] mb-3">{title}</h3>
              <p className="text-[14px] text-[#7a6a65] leading-[1.8]">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Journey timeline ── */}
      <div className="bg-[#7D1935] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/50 mb-3">Our Journey</p>
            <h2 className="font-serif text-[32px] sm:text-[44px] font-bold text-white">How We Got Here</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MILESTONES.map(({ year, text }, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-5">
                  <span className="font-serif font-bold text-white text-sm">{i + 1}</span>
                </div>
                <h3 className="font-serif text-[17px] font-bold text-white mb-3">{year}</h3>
                <p className="text-[13px] text-white/65 leading-[1.8]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-4">Wear the Story</p>
          <h2 className="font-serif text-[32px] sm:text-[44px] font-bold text-[#1a0a08] mb-5">
            Find a piece<br />made for you
          </h2>
          <p className="text-[15px] text-[#6b5a55] mb-10 leading-relaxed max-w-md mx-auto">
            Browse our collection of handcrafted jewellery, or tell us exactly what you have in mind and we'll create it.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-[#7D1935] hover:bg-[#9a1f40] text-white px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Shop Collection
            </Link>
            <Link
              to="/customize"
              className="border border-[#7D1935]/30 hover:border-[#7D1935] text-[#7D1935] px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#7D1935]/5"
            >
              Custom Order
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
