import SEOHead from '@/components/common/SEOHead'

export default function ShippingPolicy() {
  return (
    <>
      <SEOHead title="Shipping Policy" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 prose prose-sm text-foreground/80">
        <h1 className="font-serif text-3xl font-bold text-foreground">Shipping Policy</h1>
        <h2>Processing Time</h2>
        <p>All orders are processed and dispatched within <strong>3–5 working days</strong> from the date of confirmed payment. Custom orders may take 7–14 days.</p>
        <h2>Shipping Charges</h2>
        <ul>
          <li><strong>Free Shipping</strong> on orders above ₹5,000</li>
          <li><strong>₹99</strong> for orders between ₹2,000–₹4,999</li>
          <li><strong>₹199</strong> for orders below ₹2,000</li>
        </ul>
        <h2>Delivery Timeline</h2>
        <p>Once dispatched, delivery takes <strong>3–7 business days</strong> depending on your location. You'll receive a tracking ID via email/WhatsApp.</p>
        <h2>Delivery Areas</h2>
        <p>We currently ship <strong>Pan India</strong>. International shipping is not available yet.</p>
        <h2>Packaging</h2>
        <p>All jewellery is carefully packaged in our signature Meena Rajwada gift box, ready for gifting or storing.</p>
        <h2>Contact</h2>
        <p>For shipping queries: <a href="mailto:hello@meenarajwada.com" className="text-primary">hello@meenarajwada.com</a></p>
      </div>
    </>
  )
}
