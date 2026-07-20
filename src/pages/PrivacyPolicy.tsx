import SEOHead from '@/components/common/SEOHead'
import { Shield, Eye, Database, Cookie, Lock, Phone, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy" />

      {/* Hero */}
      <div className="bg-[#7D1935] text-white py-12 px-4 text-center">
        <p className="text-xs tracking-[4px] uppercase text-white/60 mb-2">Meena Rajwada</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-white/70 text-sm">Last updated: July 2025</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['No Data Selling', 'Encrypted Payments', 'Secure Storage', 'Your Data is Safe'].map(tag => (
            <span key={tag} className="bg-white/10 border border-white/20 text-white/90 text-xs px-4 py-1.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Intro */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-sm text-amber-800 leading-relaxed">At Meena Rajwada, your privacy matters. This policy explains what information we collect, how we use it, and how we keep it safe. By using our website and placing an order, you agree to this policy.</p>
        </div>

        {/* What we collect */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Information We Collect</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Personal details', value: 'Name, email address, phone number, delivery address' },
              { label: 'Order information', value: 'Products ordered, payment status, order history' },
              { label: 'Usage data', value: 'Pages visited, browser type, device — collected via Google Analytics' },
              { label: 'Communications', value: 'Messages sent to us via WhatsApp, email, or contact form' },
            ].map(({ label, value }, i) => (
              <div key={i} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#7D1935] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How we use it */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">How We Use Your Information</h2>
          </div>
          <div className="space-y-2">
            {[
              'Process and fulfil your orders',
              'Send order confirmation, dispatch updates, and tracking details',
              'Respond to customer support queries',
              'Send promotional messages if you have opted in (unsubscribe anytime)',
              'Improve our website, products, and services',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data sharing */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Data Sharing</h2>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800 font-semibold">We do not sell your personal information — ever.</p>
          </div>
          <p className="text-sm text-foreground/80 mb-3 leading-relaxed">We share data only with trusted service providers necessary to operate our business:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'Cashfree', purpose: 'Payment processing' },
              { name: 'Supabase', purpose: 'Secure data storage' },
              { name: 'Resend', purpose: 'Transactional emails' },
              { name: 'Google Analytics', purpose: 'Website usage analytics' },
            ].map(({ name, purpose }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#7D1935] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cookies & Security */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold">Cookies</h2>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">We use cookies for session management and analytics. You can disable cookies in your browser settings, though some features may not work correctly.</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold">Data Security</h2>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">All payments are encrypted and PCI-DSS compliant via Cashfree. We never store card details. Your data is secured using industry-standard encryption.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#7D1935] text-white rounded-2xl p-6 text-center">
          <h2 className="font-serif text-xl font-semibold mb-2">Privacy Concerns?</h2>
          <p className="text-white/70 text-sm mb-5">We're happy to help with any data or privacy related questions.</p>
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
