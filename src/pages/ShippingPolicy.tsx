import SEOHead from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

export default function ShippingPolicy() {
  return (
    <>
      <SEOHead title="Shipping Policy – Meena Rajwada" />

      {/* Page header */}
      <div className="border-b border-border/60 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary/70 mb-3">Meena Rajwada</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4 leading-tight">Shipping Policy</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">Everything you need to know about how your order is packed, dispatched, and delivered to you across India.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-4">Last updated: July 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">

        {/* Pre-order callout */}
        <div className="border-l-4 border-primary bg-primary/[0.04] rounded-r-xl px-6 py-5 mb-12">
          <p className="font-serif text-lg font-semibold text-foreground mb-1">We make your piece after you order</p>
          <p className="text-sm text-foreground/70 leading-relaxed">Every item in our collection is handcrafted to order. Once your payment is confirmed, our artisans begin work on your piece. Nothing is dispatched before payment — this ensures every order receives the attention it deserves.</p>
        </div>

        {/* Shipping charges */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Shipping Charges</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr] divide-x divide-border">
              <div className="p-6 sm:p-8">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-3">Orders above ₹999</p>
                <p className="font-serif text-4xl font-semibold text-green-700 mb-2">Free</p>
                <p className="text-sm text-muted-foreground leading-relaxed">No shipping charges. We cover the delivery cost entirely.</p>
              </div>
              <div className="p-6 sm:p-8 bg-background/60">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-3">Orders below ₹999</p>
                <p className="font-serif text-4xl font-semibold text-foreground mb-2">₹99</p>
                <p className="text-sm text-muted-foreground leading-relaxed">A flat shipping charge is applied at checkout.</p>
              </div>
            </div>
            <div className="border-t border-border bg-muted/30 px-6 py-3">
              <p className="text-xs text-muted-foreground">Minimum order value is ₹500. Orders below this amount cannot be placed.</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">How Long Will It Take?</h2>
          <div className="space-y-0">
            {[
              { step: '01', title: 'Order confirmed', desc: 'Payment verified — your order is confirmed and crafting begins.', time: 'Day 0' },
              { step: '02', title: 'Handcrafting', desc: 'Our artisans carefully craft and quality-check your piece.', time: '5–7 working days' },
              { step: '03', title: 'Packed & dispatched', desc: 'Your jewellery is packed in our signature gift box and handed to the courier. You receive a tracking number via email and WhatsApp.', time: 'Day 6–8' },
              { step: '04', title: 'Delivered to you', desc: 'Your order arrives at your door, across anywhere in India.', time: '+3–5 business days' },
            ].map(({ step, title, desc, time }, i, arr) => (
              <div key={step} className="flex gap-5 sm:gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-primary">{step}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1 min-h-[32px]" />}
                </div>
                <div className="pb-8">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <p className="font-semibold text-foreground text-sm">{title}</p>
                    <span className="text-[10px] font-medium text-primary bg-primary/[0.07] px-2.5 py-0.5 rounded-full">{time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery info */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-5">Delivery Coverage</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-2xl p-6">
              <p className="font-semibold text-sm mb-2">Pan India Delivery</p>
              <p className="text-sm text-muted-foreground leading-relaxed">We ship to all states and union territories across India. International shipping is not available at this time.</p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-6">
              <p className="font-semibold text-sm mb-2">Signature Gift Packaging</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Every order is packed in our Meena Rajwada gift box — beautiful, secure, and ready to gift.</p>
            </div>
          </div>
        </section>

        {/* Delays note */}
        <section className="mb-12 bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5">
          <p className="font-semibold text-amber-900 text-sm mb-1">Possible delays</p>
          <p className="text-sm text-amber-800 leading-relaxed">During festivals, high demand periods, or unforeseen courier disruptions, delivery may take slightly longer. We will always notify you proactively via WhatsApp or email if your order is delayed.</p>
        </section>

        {/* Contact */}
        <section className="border-t border-border pt-10">
          <p className="font-serif text-xl font-semibold text-foreground mb-4">Have a shipping question?</p>
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
