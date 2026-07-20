import SEOHead from '@/components/common/SEOHead'
import { Video, RefreshCw, XCircle, AlertTriangle, CheckCircle, Phone, Mail, Clock } from 'lucide-react'

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead title="Return & Refund Policy" />

      {/* Hero */}
      <div className="bg-[#7D1935] text-white py-12 px-4 text-center">
        <p className="text-xs tracking-[4px] uppercase text-white/60 mb-2">Meena Rajwada</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Return &amp; Refund Policy</h1>
        <p className="text-white/70 text-sm">Last updated: July 2025</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['No Returns', 'No Exchange', 'Replacement for Damage', 'Unboxing Video Required'].map(tag => (
            <span key={tag} className="bg-white/10 border border-white/20 text-white/90 text-xs px-4 py-1.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Custom made notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold text-amber-900 mb-2">Every Piece is Custom Made to Order</h2>
          <p className="text-sm text-amber-800 leading-relaxed">Since each jewellery piece is handcrafted specifically for your order after payment is confirmed, we do not accept returns or exchanges for change of mind, personal preference, or size concerns. Please review your order carefully before placing it.</p>
        </div>

        {/* What we don't accept */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">What We Don't Accept</h2>
          </div>
          <div className="space-y-3">
            {[
              'Returns or exchanges for change of mind',
              'Returns for personal preference or size issues',
              'Colour variation due to screen display or lighting',
              'Minor imperfections natural to handmade jewellery',
              'Cancellations after the order has been dispatched',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellations */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Cancellations</h2>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">You may cancel your order <strong>only before it has been dispatched</strong>. Contact us immediately after placing your order via WhatsApp or email. Once dispatched, cancellations are not possible and no refund will be issued.</p>
        </div>

        {/* Transit damage */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Transit Damage or Missing Item</h2>
          </div>
          <p className="text-sm text-foreground/80 mb-5 leading-relaxed">If your parcel arrives damaged or an item is missing, follow these steps:</p>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Record unboxing video', desc: 'Record a clear, uncut video showing all sides of the sealed parcel before and during opening. Do not stop or edit the video.' },
              { step: '2', title: 'Contact us within 7 days', desc: 'Reach us via WhatsApp (+91 63044 24767) or email (support@meenarajwada.com) within 7 days of receiving the parcel.' },
              { step: '3', title: 'Share the details', desc: 'Send your Order Number, the unboxing video, and a description of the issue.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#7D1935] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unboxing video mandatory */}
          <div className="mt-6 bg-[#7D1935]/5 border border-[#7D1935]/20 rounded-xl p-4 flex gap-3">
            <Video className="w-5 h-5 text-[#7D1935] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#7D1935] font-medium leading-relaxed">Unboxing video is <strong>compulsory</strong>. No claim will be processed without it — no exceptions.</p>
          </div>
        </div>

        {/* Resolution */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Resolution Process</h2>
          </div>
          <p className="text-sm text-foreground/80 mb-4 leading-relaxed">Our team reviews your claim within <strong>3–5 business days</strong> of receiving the video and details.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="font-semibold text-green-800 text-sm mb-1">If claim is valid</p>
              <p className="text-xs text-green-700 leading-relaxed">We replace the item with the same piece at no extra cost. If unavailable, a <strong>full refund</strong> is issued within 7 business days.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-800 text-sm mb-1">If claim is invalid</p>
              <p className="text-xs text-red-700 leading-relaxed">We will clearly explain the reason. No replacement or refund will be processed in this case.</p>
            </div>
          </div>
        </div>

        {/* Handmade note */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Not Considered Damage</h2>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-amber-300 pl-4">
              <p className="font-medium text-sm">Colour Variation</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Product colours may appear slightly different on your screen due to display settings and lighting. This is not a defect.</p>
            </div>
            <div className="border-l-2 border-amber-300 pl-4">
              <p className="font-medium text-sm">Handmade Character</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Slight variations or minor imperfections are a natural characteristic of fully handcrafted jewellery. They make your piece truly one of a kind and are not considered damage.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#7D1935] text-white rounded-2xl p-6 text-center">
          <h2 className="font-serif text-xl font-semibold mb-4">Need Help?</h2>
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
