import SEOHead from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

const clauses = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using meenarajwada.com and placing an order, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website or services.',
  },
  {
    title: 'Made-to-Order Model',
    body: 'All products on Meena Rajwada are handcrafted specifically after your order is placed. Full payment is collected at checkout before any item is crafted or dispatched. An order is considered confirmed only after successful payment.',
  },
  {
    title: 'Minimum Order Value',
    body: 'The minimum order value is ₹500. Orders below this amount cannot be processed at checkout.',
  },
  {
    title: 'Pricing & Taxes',
    body: 'All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to update pricing without prior notice. The price displayed at the time of checkout is the final price you pay.',
  },
  {
    title: 'Payments',
    body: 'We accept UPI, credit cards, debit cards, net banking, and wallets. All payments are processed through a secure, PCI-DSS compliant payment partner. Meena Rajwada does not store any card or bank account details.',
  },
  {
    title: 'Cancellations',
    body: 'Orders may be cancelled only before dispatch. Once your order has been dispatched, cancellations are not accepted. If you need to cancel, contact us immediately after placing your order.',
  },
  {
    title: 'Returns & Refunds',
    body: 'We do not accept returns or exchanges. In the event of transit damage or a missing item, contact us within 7 days of delivery with a mandatory, uncut unboxing video. Valid claims are resolved by replacement first; a refund is issued only if the replacement item is no longer available.',
    link: { to: '/return-policy', label: 'Read our full Returns & Refunds Policy' },
  },
  {
    title: 'Shipping',
    body: 'We ship Pan India. Dispatch takes 5–7 working days after payment confirmation. Shipping is free on orders above ₹999 and ₹99 flat for orders below ₹999.',
    link: { to: '/shipping-policy', label: 'Read our full Shipping Policy' },
  },
  {
    title: 'Intellectual Property',
    body: 'All content on this website — including product images, designs, written descriptions, videos, and brand assets — is the exclusive property of Meena Rajwada. Reproduction, copying, or commercial use of any content without written permission is strictly prohibited.',
  },
  {
    title: 'Limitation of Liability',
    body: "Our liability in connection with any product purchased through this website is strictly limited to the purchase price of that product. We are not liable for indirect, incidental, or consequential losses of any nature.",
  },
  {
    title: 'Governing Law',
    body: 'These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of our website are subject to the exclusive jurisdiction of the courts of Telangana, India.',
  },
]

export default function Terms() {
  return (
    <>
      <SEOHead title="Terms & Conditions – Meena Rajwada" />

      {/* Page header */}
      <div className="border-b border-border/60 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary/70 mb-3">Meena Rajwada</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4 leading-tight">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">Please read these terms carefully before placing an order. By using our website, you agree to all terms listed below.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-4">Last updated: July 2025 · Applicable to all orders on meenarajwada.com</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">

        <div className="divide-y divide-border/60">
          {clauses.map(({ title, body, link }, i) => (
            <div key={i} className="py-8 first:pt-0">
              <div className="flex gap-5 sm:gap-8">
                <span className="font-serif text-4xl font-semibold text-primary/20 leading-none flex-shrink-0 w-10 text-right select-none">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">{title}</h2>
                  <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  {link && (
                    <Link to={link.to} className="inline-block mt-3 text-xs font-semibold text-primary hover:underline underline-offset-4">
                      {link.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <section className="border-t border-border pt-10 mt-2">
          <p className="font-serif text-xl font-semibold text-foreground mb-4">Questions about our terms?</p>
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
