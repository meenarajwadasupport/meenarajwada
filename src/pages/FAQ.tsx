import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const categories = [
  {
    label: 'Orders & Payment',
    faqs: [
      { q: 'What is the minimum order value?', a: 'The minimum order value is ₹500. Orders below this amount cannot be processed at checkout.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI, credit cards, debit cards, net banking, and wallets. All payments are processed securely through our payment partner.' },
      { q: 'Is it safe to pay on your website?', a: 'Yes. All transactions on our website are encrypted and processed through a PCI-DSS compliant payment system. We never store your card or bank account details.' },
      { q: 'Can I cancel my order after placing it?', a: 'Cancellations are only possible before your order is dispatched. Please contact us immediately via WhatsApp if you need to cancel. Once dispatched, cancellations cannot be accepted.' },
    ],
  },
  {
    label: 'Shipping & Delivery',
    faqs: [
      { q: 'How long does dispatch take?', a: 'Since every piece is handcrafted to order, dispatch takes 5–7 working days from the date of payment confirmation.' },
      { q: 'How long does delivery take after dispatch?', a: 'Once dispatched, delivery typically takes 3–5 business days depending on your location across India.' },
      { q: 'Do you offer free shipping?', a: 'Yes. Orders above ₹999 receive free shipping. A flat charge of ₹99 applies to orders below ₹999.' },
      { q: 'Do you ship outside India?', a: 'At this time, we ship only within India. International shipping is something we are working towards.' },
      { q: 'How will I get my tracking details?', a: 'Once your order is dispatched, we will send your tracking number via email and WhatsApp.' },
    ],
  },
  {
    label: 'Returns & Refunds',
    faqs: [
      { q: 'Can I return or exchange a product?', a: 'We do not accept returns or exchanges, as all jewellery is custom made to order. However, if your order arrives damaged in transit or an item is missing, we will resolve it — please see the next question.' },
      { q: 'What if my order arrives damaged or has a missing item?', a: 'Record a clear, uncut unboxing video before opening the parcel. Contact us within 7 days of receiving it via WhatsApp with your Order Number and the video. The unboxing video is mandatory — we cannot process claims without it.' },
      { q: 'What happens after I raise a damage claim?', a: 'Our team reviews your claim within 3–5 business days. If valid, we replace the item at no extra cost. If the same item is no longer available, a full refund is issued within 7 business days.' },
      { q: 'Is colour variation considered a defect?', a: 'No. Colours may appear slightly different on screen compared to the actual product due to display settings and lighting. This is not a defect and is not eligible for replacement.' },
    ],
  },
  {
    label: 'Products & Craft',
    faqs: [
      { q: 'Is all your jewellery handmade?', a: 'Yes — every piece is handcrafted by skilled artisans using quality materials including kundan stones, silk threads, and carefully sourced metals.' },
      { q: 'My piece has a slight imperfection. Is that normal?', a: 'Yes, completely. Minor variations in finish are a natural characteristic of fully handmade jewellery. They make each piece uniquely yours and are not considered defects.' },
      { q: 'Can I get a piece customised?', a: 'Absolutely. Visit our Customize page, describe what you have in mind, and we will get back to you within 24 hours to discuss.' },
      { q: 'Are products in stock, or made to order?', a: 'All items are made to order following our pre-order model. Payment is confirmed first, your piece is then handcrafted and dispatched within 5–7 working days.' },
    ],
  },
]

export default function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <>
      <SEOHead title="FAQ – Meena Rajwada" url="https://www.meenarajwada.com/faq" />

      {/* Page header */}
      <div className="border-b border-border/60 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary/70 mb-3">Meena Rajwada</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4 leading-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">Answers to the questions we hear most often. If you don't find what you're looking for, write to us directly.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-12">

        {categories.map((cat) => (
          <section key={cat.label}>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-5">{cat.label}</h2>
            <div className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden bg-white">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.label}-${i}`
                const open = openKey === key
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpenKey(open ? null : key)}
                      className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-medium text-sm text-foreground leading-snug">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-6 pb-5 border-t border-border/40 pt-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Still have questions */}
        <section className="border-t border-border pt-10">
          <p className="font-serif text-xl font-semibold text-foreground mb-2">Still have a question?</p>
          <p className="text-sm text-muted-foreground mb-5">We're happy to help — reach out and we'll get back to you the same day.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:support@meenarajwada.com" className="inline-flex items-center gap-2 text-sm text-foreground/80 border border-border rounded-xl px-5 py-3 hover:border-primary hover:text-primary transition-colors">
              support@meenarajwada.com
            </a>
            <a href="https://wa.me/916304424767" className="inline-flex items-center gap-2 text-sm text-foreground/80 border border-border rounded-xl px-5 py-3 hover:border-primary hover:text-primary transition-colors">
              WhatsApp: +91 63044 24767
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Mon – Sat · 10 AM – 6 PM IST</p>
        </section>

      </div>
    </>
  )
}
