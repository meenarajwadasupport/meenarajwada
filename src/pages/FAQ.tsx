import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const faqs = [
  { q: 'How long does shipping take?', a: 'We dispatch all orders within 3–5 working days. Once dispatched, delivery takes 3–7 days depending on your location.' },
  { q: 'Do you offer free shipping?', a: 'Yes! Orders above ₹5000 get free shipping. Orders between ₹2000–₹4999 ship at ₹99, and orders below ₹2000 ship at ₹199.' },
  { q: 'Can I customize a piece?', a: 'Absolutely! We love creating custom pieces. Visit our Customize page and fill out the form — we\'ll get back to you within 24 hours.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for non-customized items. Custom pieces are non-returnable. Please see our Return Policy page for details.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, cards (debit & credit), net banking, and wallets — all processed securely through Cashfree Payments.' },
  { q: 'How do I track my order?', a: 'Once your order is dispatched, we\'ll share a tracking ID. You can also track your order on our Track Order page.' },
  { q: 'Are your materials genuine?', a: 'Yes! We use genuine silk threads, quality kundan stones, and responsibly sourced metals. Each piece is handcrafted by skilled artisans.' },
  { q: 'Do you ship outside India?', a: 'Currently we ship only within India. International shipping is something we\'re working on — stay tuned!' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <SEOHead title="FAQ" url="https://www.meenarajwada.com/faq" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <p className="section-label">Help</p>
          <h1 className="section-title">Frequently Asked Questions</h1>
          <div className="divider" />
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
