import SEOHead from '@/components/common/SEOHead'

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 prose prose-sm text-foreground/80">
        <h1 className="font-serif text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p>Last updated: June 2025</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide when placing an order or creating an account, including your name, email, phone number, and delivery address. We also collect usage data via Google Analytics.</p>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and fulfil your orders</li>
          <li>To send order confirmation and dispatch notifications</li>
          <li>To respond to customer support queries</li>
          <li>To improve our website and offerings</li>
        </ul>
        <h2>Data Sharing</h2>
        <p>We do not sell your personal information. We share data only with service providers necessary to run our business (e.g., Cashfree for payments, Supabase for data storage, Resend for emails).</p>
        <h2>Cookies</h2>
        <p>We use cookies for session management and analytics. You can disable cookies in your browser settings, though some features may not work correctly.</p>
        <h2>Data Security</h2>
        <p>We take reasonable measures to protect your data using industry-standard encryption and security practices.</p>
        <h2>Contact</h2>
        <p>For privacy concerns: <a href="mailto:hello@meenarajwada.com" className="text-primary">hello@meenarajwada.com</a></p>
      </div>
    </>
  )
}
