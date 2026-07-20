import SEOHead from '@/components/common/SEOHead'

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead title="Returns & Refunds – Meena Rajwada" />

      {/* Page header */}
      <div className="border-b border-border/60 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary/70 mb-3">Meena Rajwada</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4 leading-tight">Returns &amp; Refunds</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">Because every piece is made specifically for you, our policy is designed to protect both the craft and the customer.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-4">Last updated: July 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">

        {/* Core policy statement */}
        <div className="border-l-4 border-primary bg-primary/[0.04] rounded-r-xl px-6 py-5 mb-12">
          <p className="font-serif text-lg font-semibold text-foreground mb-1">No returns or exchanges</p>
          <p className="text-sm text-foreground/70 leading-relaxed">Since every piece is handcrafted to order, we are unable to accept returns or exchanges for change of mind, personal preference, or sizing concerns. Please review your order carefully before completing payment.</p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Cancellations</h2>
            <p className="text-sm text-foreground/75 leading-relaxed mb-3">You may cancel your order only before it has been dispatched. Contact us immediately after placing your order and we will do our best to accommodate the request.</p>
            <p className="text-sm text-foreground/75 leading-relaxed">Once your order has been dispatched, cancellation is no longer possible and no refund will be issued.</p>
          </section>

          <div className="border-t border-border/50" />

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Damaged or Missing Items</h2>
            <p className="text-sm text-foreground/75 leading-relaxed mb-6">We pack every order with great care. However, if something arrives damaged during transit or an item is missing from your parcel, please follow these steps:</p>

            <div className="space-y-5">
              {[
                { n: '1', heading: 'Record your unboxing video', body: 'Before opening the parcel, begin recording a clear, uncut video showing all sides of the sealed package. Continue recording as you open it. Do not pause, cut, or edit the video at any point.' },
                { n: '2', heading: 'Contact us within 7 days', body: 'Reach out via WhatsApp (+91 63044 24767) or email (support@meenarajwada.com) within 7 days of receiving your parcel.' },
                { n: '3', heading: 'Share your details', body: 'Send us your Order Number, the unboxing video, and a brief description of the issue. Our team will review your claim within 3–5 business days.' },
              ].map(({ n, heading, body }) => (
                <div key={n} className="flex gap-5">
                  <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{heading}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-[#7D1935]/[0.06] border border-[#7D1935]/20 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-primary mb-1">Unboxing video is mandatory</p>
              <p className="text-sm text-foreground/70 leading-relaxed">No claim can be processed without a valid unboxing video — no exceptions. This protects you and ensures every genuine issue is resolved quickly.</p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">How We Resolve Claims</h2>
            <p className="text-sm text-foreground/75 leading-relaxed mb-5">If your claim is reviewed and found valid:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-2xl p-5 bg-white">
                <p className="font-semibold text-sm text-foreground mb-2">Replacement first</p>
                <p className="text-sm text-muted-foreground leading-relaxed">We will replace the item with the same piece at no extra cost to you.</p>
              </div>
              <div className="border border-border rounded-2xl p-5 bg-white">
                <p className="font-semibold text-sm text-foreground mb-2">Refund if unavailable</p>
                <p className="text-sm text-muted-foreground leading-relaxed">If the same item is no longer available, a full refund will be issued to your original payment method within 7 business days.</p>
              </div>
            </div>
          </section>

          <div className="border-t border-border/50" />

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">What Is Not a Defect</h2>
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Colour variation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Product colours may appear slightly different on screen compared to the actual piece, depending on your display settings, brightness, and lighting. This is a natural aspect of viewing jewellery online and is not considered a defect.</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Handmade character</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Because every piece is entirely handcrafted by skilled artisans, slight variations in finish or minor imperfections may be present. These are the marks of genuine handmade craft — they make your piece unique and are not considered damage.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Contact */}
        <section className="border-t border-border pt-10 mt-10">
          <p className="font-serif text-xl font-semibold text-foreground mb-4">Need to raise a concern?</p>
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
