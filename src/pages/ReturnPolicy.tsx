import SEOHead from '@/components/common/SEOHead'

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead title="Return Policy" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 prose prose-sm text-foreground/80">
        <h1 className="font-serif text-3xl font-bold text-foreground">Return & Exchange Policy</h1>
        <h2>Return Window</h2>
        <p>We accept returns within <strong>7 days</strong> of delivery for eligible items. Items must be unused, in original condition, and in original packaging.</p>
        <h2>Non-Returnable Items</h2>
        <ul>
          <li>Customized or personalized pieces</li>
          <li>Sale / discounted items</li>
          <li>Items damaged due to mishandling</li>
        </ul>
        <h2>How to Return</h2>
        <ol>
          <li>Email us at <a href="mailto:hello@meenarajwada.com" className="text-primary">hello@meenarajwada.com</a> with your order ID and reason</li>
          <li>We'll arrange a return pickup (charges may apply)</li>
          <li>Once received and inspected, a refund or exchange is processed within 5–7 days</li>
        </ol>
        <h2>Damaged / Wrong Item</h2>
        <p>If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photos. We'll replace it at no extra cost.</p>
        <h2>Refunds</h2>
        <p>Refunds are processed to the original payment method within 5–7 working days after we receive the return.</p>
      </div>
    </>
  )
}
