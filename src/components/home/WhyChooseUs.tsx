const features = [
  {
    emoji: '🪡',
    title: 'Hand Crafted',
    desc: 'While trends come and go, handmade jewellery has a timeless appeal that transcends fashion fads.',
  },
  {
    emoji: '✨',
    title: 'Unique Designs',
    desc: 'We work closely with customers to create bespoke designs that reflect their personal style and preferences.',
  },
  {
    emoji: '💎',
    title: 'High Quality',
    desc: 'We use the finest quality materials, ensuring each piece is not only beautiful but also durable and long-lasting.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-14 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center">
          {features.map(f => (
            <div key={f.title} className="flex flex-col items-center px-4">
              {/* Emoji icon */}
              <span className="text-4xl sm:text-5xl mb-4" role="img" aria-label={f.title}>
                {f.emoji}
              </span>
              <h3 className="text-base font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed max-w-[260px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
