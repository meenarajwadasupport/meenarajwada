import SEOHead from '@/components/common/SEOHead'
import { Package, Truck, MapPin, Clock, Gift, Phone, Mail, Zap } from 'lucide-react'

export default function ShippingPolicy() {
  return (
    <>
      <SEOHead title="Shipping Policy" />

      {/* Hero */}
      <div className="bg-[#7D1935] text-white py-12 px-4 text-center">
        <p className="text-xs tracking-[4px] uppercase text-white/60 mb-2">Meena Rajwada</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Shipping Policy</h1>
        <p className="text-white/70 text-sm">Last updated: July 2025</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['Free Shipping above ₹999', 'Pan India Delivery', '5–7 Day Dispatch', 'Pre-Order Model'].map(tag => (
            <span key={tag} className="bg-white/10 border border-white/20 text-white/90 text-xs px-4 py-1.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Pre-order model */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <h2 className="font-serif text-xl font-semibold text-amber-900">Pre-Order Model</h2>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">All items on Meena Rajwada are <strong>handcrafted to order</strong>. Payment is collected first, and your piece is then carefully crafted and dispatched. No item is ever shipped without confirmed payment.</p>
        </div>

        {/* Shipping charges */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Shipping Charges</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-green-700 font-serif">FREE</p>
              <p className="text-sm text-green-800 mt-1 font-medium">Orders above ₹999</p>
              <p className="text-xs text-green-600 mt-2">No shipping charge — enjoy free delivery across India</p>
            </div>
            <div className="bg-muted/40 border border-border rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-foreground font-serif">₹99</p>
              <p className="text-sm text-foreground/80 mt-1 font-medium">Orders below ₹999</p>
              <p className="text-xs text-muted-foreground mt-2">Flat rate shipping charge applied at checkout</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">Minimum order value is ₹500. Orders below ₹500 are not accepted.</p>
        </div>

        {/* Dispatch & Delivery */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Dispatch &amp; Delivery Timeline</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: <Package className="w-4 h-4 text-[#7D1935]" />, label: 'Processing & Dispatch', value: '5–7 working days', note: 'Time required to handcraft and quality-check your piece after payment confirmation' },
              { icon: <Truck className="w-4 h-4 text-[#7D1935]" />, label: 'Delivery after dispatch', value: '3–5 business days', note: 'Depending on your location across India' },
            ].map(({ icon, label, value, note }, i) => (
              <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#7D1935]/10 flex items-center justify-center flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm mt-0.5">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">You will receive a tracking number via <strong>email and WhatsApp</strong> once your order is dispatched.</p>
        </div>

        {/* Delivery areas */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Delivery Areas</h2>
          </div>
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <p className="text-sm text-purple-800"><strong>Pan India</strong> — We deliver to all states and union territories across India.</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">International shipping is not available at this time.</p>
        </div>

        {/* Packaging */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Packaging</h2>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">All jewellery is carefully packed in our <strong>signature Meena Rajwada gift box</strong> — beautifully presented and ready for gifting or safe storage. Every parcel is double-checked before dispatch.</p>
        </div>

        {/* Delays */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Possible Delays</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">In rare cases, delays may occur during festivals, high demand periods, or courier disruptions. We will proactively notify you via WhatsApp or email if your order is delayed.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#7D1935] text-white rounded-2xl p-6 text-center">
          <h2 className="font-serif text-xl font-semibold mb-4">Shipping Queries?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:support@meenarajwada.com" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Mail className="w-4 h-4" /> support@meenarajwada.com
            </a>
            <a href="https://wa.me/916304424767" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 text-sm">
              <Phone className="w-4 h-4" /> +91 63044 24767
            </a>
          </div>
          <p className="text-white/50 text-xs mt-4">Monday – Saturday · 10 AM – 6 PM IST</p>
        </div>

      </div>
    </>
  )
}
