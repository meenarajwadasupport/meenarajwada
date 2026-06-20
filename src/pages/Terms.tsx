import SEOHead from '@/components/common/SEOHead'

export default function Terms() {
  return (
    <>
      <SEOHead title="Terms & Conditions" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 prose prose-sm text-foreground/80">
        <h1 className="font-serif text-3xl font-bold text-foreground">Terms & Conditions</h1>
        <p>Last updated: June 2025</p>
        <h2>Acceptance</h2>
        <p>By using meenarajwada.com, you agree to these terms. If you do not agree, please do not use our website.</p>
        <h2>Products & Pricing</h2>
        <p>All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the right to change prices without prior notice.</p>
        <h2>Orders</h2>
        <p>An order is confirmed only after successful payment. We reserve the right to cancel orders in case of product unavailability or fraudulent activity.</p>
        <h2>Intellectual Property</h2>
        <p>All content on this website — including images, text, and designs — is the property of Meena Rajwada and may not be reproduced without permission.</p>
        <h2>Limitation of Liability</h2>
        <p>Meena Rajwada is not liable for indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        <h2>Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in India.</p>
        <h2>Contact</h2>
        <p>For questions: <a href="mailto:hello@meenarajwada.com" className="text-primary">hello@meenarajwada.com</a></p>
      </div>
    </>
  )
}
