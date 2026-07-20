import { useState } from 'react'
import { ChevronDown, HelpCircle, Phone, Mail } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const categories = [
  {
    label: 'Orders & Payment',
    faqs: [
      { q: 'What is the minimum order value?', a: 'The minimum order value is ₹500. Orders below this amount cannot be processed at checkout.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI, credit & debit cards, net banking, and wallets — all processed securely through Cashfree Payments.' },
      { q: 'Is it safe to pay on your website?', a: 'Yes. All payments are encrypted and PCI-DSS compliant via Cashfree. We never store your card or bank details.' },
      { q: 'Can I cancel my order after placing it?', a: 'Cancellations are accepted only before your order is dispatched. Once dispatched, no cancellation is possible. Contact us immediately via WhatsApp if you need to cancel.' },
    ],
  },
  {
    label: 'Shipping & Delivery',
    faqs: [
      { q: 'How long does dispatch take?', a: 'Since all jewellery is handcrafted to order, dispatch takes 5–7 working days from the date of confirmed payment.' },
      { q: 'How long does delivery take after dispatch?', a: 'Delivery takes 3–5 business days after dispatch, depending on your location across India.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Orders above ₹999 get free shipping. Orders below ₹999 have a flat shipping charge of ₹99.' },
      { q: 'Do you ship outside India?', a: 'Currently we ship only within India (Pan India). International shipping is not available at this time.' },
      { q: 'How will I receive tracking details?', a: 'Once your order is dispatched, we will share a tracking number via email and WhatsApp.' },
    ],
  },
  {
    label: 'Returns & Exchanges',
    faqs: [
      { q: 'Can I return or exchange a product?', a: 'We do not accept returns or exchanges since all jewellery is custom made to order. However, if your item arrives damaged during transit or a piece is missing, we will replace it — see below.' },
      { q: 'What if my order arrives damaged?', a: 'Record a clear, uncut unboxing video before opening the parcel. Contact us within 7 days of receiving it via WhatsApp with your Order Number and the video. The unboxing video is mandatory for any damage claim.' },
      { q: 'What is the resolution for a valid damage claim?', a: 'If your claim is valid, we will replace the item at no extra cost. If the same item is unavailable, we will issue a full refund within 7 business days.' },
      { q: 'Is slight colour variation considered a defect?', a: 'No. Product colours may appear slightly different on screen due to display settings and lighting. This is not a defect and is not eligible for replacement.' },
    ],
  },
  {
    label: 'Products & Customization',
    faqs: [
      { q: 'Are your products fully handmade?', a: 'Yes! Every piece is handcrafted by skilled artisans using quality materials like kundan stones, silk threads, and responsibly sourced metals.' },
      { q: 'My piece has a minor imperfection. Is that normal?', a: 'Yes, absolutely. Since all our jewellery is fully handmade, slight variations or minor imperfections are a natural characteristic. They make your piece unique and are not considered damage.' },
      { q: 'Can I customize a piece?', a: 'Yes! We love creating custom pieces. Visit our Customize page, fill out the form, and we will get back to you within 24 hours.' },
      { q: 'Are the products in stock or made to order?', a: 'All items are made to order. We follow a pre-order model — payment is confirmed first, then your piece is handcrafted and dispatched.' },
    ],
  },
]

export default function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <>
      <SEOHead title="FAQ" url="https://www.meenarajwada.com/faq" />

      {/* Hero */}
      <div className="bg-[#7D1935] text-white py-12 px-4 text-center">
        <p className="text-xs tracking-[4px] uppercase text-white/60 mb-2">Meena Rajwada</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-white/70 text-sm">Everything you need to know about ordering from us</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-5 h-5 text-[#7D1935]" />
              <h2 className="font-serif text-xl font-semibold">{cat.label}</h2>
            </div>
            <div className="space-y-2">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.label}-${i}`
                const open = openKey === key
                return (
                  <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenKey(open ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-5 pb-4 border-t border-border/40 pt-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="bg-[#7D1935] text-white rounded-2xl p-6 text-center">
          <h2 className="font-serif text-xl font-semibold mb-2">Still have a question?</h2>
          <p className="text-white/70 text-sm mb-5">We're here to help — reach out anytime.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:support@meenarajwada.com" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Mail className="w-4 h-4" /> support@meenarajwada.com
            </a>
            <a href="https://wa.me/916304424767" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Phone className="w-4 h-4" /> +91 63044 24767
            </a>
          </div>
          <p className="text-white/50 text-xs mt-4">Monday – Saturday · 10 AM – 6 PM IST</p>
        </div>

      </div>
    </>
  )
}
