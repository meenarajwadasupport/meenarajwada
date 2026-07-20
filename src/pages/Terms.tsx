import SEOHead from '@/components/common/SEOHead'
import { ShoppingBag, CreditCard, RefreshCw, Truck, Shield, Gavel, Phone, Mail, AlertCircle, Scale } from 'lucide-react'

const sections = [
  {
    icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50',
    title: '1. Acceptance',
    content: 'By using meenarajwada.com and placing an order, you agree to these Terms & Conditions. If you do not agree, please do not use our website or services.',
  },
  {
    icon: <ShoppingBag className="w-5 h-5 text-amber-500" />,
    bg: 'bg-amber-50',
    title: '2. Pre-Order & Payment',
    content: 'All products on Meena Rajwada are made-to-order handcrafted jewellery. Full payment is collected at checkout before any item is crafted or dispatched. An order is confirmed only after successful payment verification.',
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    bg: 'bg-red-50',
    title: '3. Minimum Order Value',
    content: 'The minimum order value is ₹500. Orders below this amount cannot be processed at checkout.',
  },
  {
    icon: <CreditCard className="w-5 h-5 text-green-600" />,
    bg: 'bg-green-50',
    title: '4. Pricing & Taxes',
    content: 'All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the right to update prices without prior notice. The price shown at the time of checkout is the final price.',
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-50',
    title: '5. Cancellations',
    content: 'Orders may be cancelled only before dispatch. Once an item is dispatched, cancellations are not accepted. Contact us immediately after placing your order if you wish to cancel.',
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-rose-500" />,
    bg: 'bg-rose-50',
    title: '6. Returns & Refunds',
    content: 'We do not accept returns or exchanges. In case of transit damage or a missing item, contact us within 7 days of delivery with a mandatory uncut unboxing video. Valid claims are resolved by replacement first; a refund is issued only if the replacement item is unavailable. See our Return & Refund Policy for full details.',
    link: { href: '/return-policy', label: 'Return & Refund Policy →' },
  },
  {
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    bg: 'bg-blue-50',
    title: '7. Shipping',
    content: 'Dispatch takes 5–7 working days after payment. Shipping is free on orders above ₹999 and ₹99 flat for orders below ₹999. See our Shipping Policy for full details.',
    link: { href: '/shipping-policy', label: 'Shipping Policy →' },
  },
  {
    icon: <CreditCard className="w-5 h-5 text-green-700" />,
    bg: 'bg-green-50',
    title: '8. Payment Gateway',
    content: 'Payments are processed securely via Cashfree. Meena Rajwada does not store any card or bank account details. All transactions are encrypted and PCI-DSS compliant.',
  },
  {
    icon: <Shield className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-50',
    title: '9. Intellectual Property',
    content: 'All content on this website — including product images, designs, text, videos, and branding — is the exclusive property of Meena Rajwada. Reproduction, copying, or commercial use without written permission is strictly prohibited.',
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50',
    title: '10. Limitation of Liability',
    content: 'Meena Rajwada\'s liability is limited to the value of the order placed. We are not responsible for indirect, incidental, or consequential losses arising from the use of our products or website.',
  },
  {
    icon: <Gavel className="w-5 h-5 text-gray-500" />,
    bg: 'bg-gray-50',
    title: '11. Governing Law',
    content: 'These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Telangana, India.',
    icon: <Scale className="w-5 h-5 text-gray-500" />,
    bg: 'bg-gray-50',
  },
]

export default function Terms() {
  return (
    <>
      <SEOHead title="Terms & Conditions" />

      {/* Hero */}
      <div className="bg-[#7D1935] text-white py-12 px-4 text-center">
        <p className="text-xs tracking-[4px] uppercase text-white/60 mb-2">Meena Rajwada</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Terms &amp; Conditions</h1>
        <p className="text-white/70 text-sm">Last updated: July 2025 · Applicable to all orders on meenarajwada.com</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">

        <p className="text-sm text-muted-foreground leading-relaxed text-center pb-4">Please read these terms carefully before placing an order. By using our website, you agree to the following terms.</p>

        {sections.map(({ icon, bg, title, content, link }, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
              <div>
                <h2 className="font-serif text-lg font-semibold mb-2">{title}</h2>
                <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
                {link && (
                  <a href={link.href} className="inline-block mt-2 text-xs text-primary font-medium hover:underline">{link.label}</a>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-[#7D1935] text-white rounded-2xl p-6 text-center mt-8">
          <h2 className="font-serif text-xl font-semibold mb-2">Questions about our Terms?</h2>
          <p className="text-white/70 text-sm mb-5">We're happy to clarify anything.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:support@meenarajwada.com" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Mail className="w-4 h-4" /> support@meenarajwada.com
            </a>
            <a href="https://wa.me/916304424767" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Phone className="w-4 h-4" /> +91 63044 24767
            </a>
          </div>
        </div>

      </div>
    </>
  )
}
