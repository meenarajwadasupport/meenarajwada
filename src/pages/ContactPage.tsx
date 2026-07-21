import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
  subject: z.string().min(3),
  message: z.string().min(10),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.from('contact_messages').insert(data)
    if (error) { toast.error('Could not send. Please try again.'); return }
    fetch('/api/send-contact-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {})
    toast.success('Message sent! We\'ll reply within 24 hours.')
    reset()
  }

  const inputCls = 'w-full border border-[#e8ddd8] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7D1935] focus:ring-2 focus:ring-[#7D1935]/10 bg-white transition-all duration-200 placeholder:text-[#b8a8a2]'
  const labelCls = 'block text-[10px] font-bold tracking-[0.18em] uppercase text-[#9a8880] mb-1.5'

  return (
    <>
      <SEOHead title="Contact Us" url="https://www.meenarajwada.com/contact" />

      {/* ── Page header ── */}
      <div className="bg-[#FAF7F5] border-b border-[#ece3dc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-3">We're Here for You</p>
          <h1 className="font-serif text-[38px] sm:text-[54px] font-bold text-[#1a0a08] leading-[1.1] max-w-xl">
            Let's Talk
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="w-12 h-px bg-[#7D1935]/30" />
            <span className="text-[#7D1935]/50 text-sm">✦</span>
            <span className="w-12 h-px bg-[#7D1935]/30" />
          </div>
          <p className="text-[15px] text-[#6b5a55] mt-5 max-w-lg leading-relaxed">
            Questions about an order, custom jewellery, or just want to say hello — we'd love to hear from you. We typically reply within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

          {/* ── Left: contact details ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Contact cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'support@meenarajwada.com',
                  sub: 'For orders, queries & general support',
                  href: 'mailto:support@meenarajwada.com',
                },
                {
                  icon: MessageCircle,
                  label: 'WhatsApp',
                  value: '+91 63044 24767',
                  sub: 'Fastest response — usually within a few hours',
                  href: 'https://wa.me/916304424767',
                },
                {
                  icon: MapPin,
                  label: 'Delivery',
                  value: 'Pan-India',
                  sub: 'We ship across all states in India',
                  href: null,
                },
                {
                  icon: Clock,
                  label: 'Response Time',
                  value: 'Within 24 hours',
                  sub: 'Monday – Saturday, 10am – 7pm IST',
                  href: null,
                },
              ].map(({ icon: Icon, label, value, sub, href }) => (
                <div key={label} className="group flex gap-4 bg-white border border-[#ece3dc] rounded-2xl p-5 hover:border-[#7D1935]/30 hover:shadow-[0_4px_24px_-8px_rgba(125,25,53,0.1)] transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#7D1935]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7D1935]/12 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-[#7D1935]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#9a8880] mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        className="text-[14.5px] font-semibold text-[#1a0a08] hover:text-[#7D1935] transition-colors leading-tight">
                        {value}
                      </a>
                    ) : (
                      <p className="text-[14.5px] font-semibold text-[#1a0a08] leading-tight">{value}</p>
                    )}
                    <p className="text-[12px] text-[#9a8880] mt-1 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/916304424767"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-bold tracking-[0.12em] uppercase transition-all duration-300 shadow-md shadow-[#25D366]/20 hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />
              Chat on WhatsApp
            </a>

            {/* Divider + note */}
            <div className="border-l-2 border-[#7D1935]/20 pl-4">
              <p className="text-[12.5px] text-[#7a6a65] leading-relaxed italic">
                "Every piece we make is made for someone special — and every message we receive deserves the same care."
              </p>
              <p className="text-[11px] text-[#9a8880] mt-2 font-semibold">— Meena Rajwada</p>
            </div>
          </div>

          {/* ── Right: form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3">
            <div className="bg-white border border-[#ece3dc] rounded-3xl p-7 sm:p-10 shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">

              <h2 className="font-serif text-[26px] font-bold text-[#1a0a08] mb-1">Send a Message</h2>
              <p className="text-[13px] text-[#9a8880] mb-8">Fill in the form and we'll get back to you.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Your Name</label>
                  <input {...register('name')} placeholder="Priya Sharma" className={inputCls} />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1.5">{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Mobile Number</label>
                  <input {...register('phone')} type="tel" placeholder="9876543210" className={inputCls} maxLength={10} />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1.5">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Email Address</label>
                  <input {...register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1.5">{errors.email.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Subject</label>
                  <input {...register('subject')} placeholder="e.g. Query about my order MR-10023" className={inputCls} />
                  {errors.subject && <p className="text-[11px] text-red-500 mt-1.5">{errors.subject.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Message</label>
                  <textarea {...register('message')} rows={5} placeholder="Tell us how we can help you…" className={`${inputCls} resize-none`} />
                  {errors.message && <p className="text-[11px] text-red-500 mt-1.5">{errors.message.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:shadow-[#7D1935]/25 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>

              <p className="text-center text-[11px] text-[#b8a8a2] mt-4">
                We reply to all messages within 24 hours, Mon – Sat
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
