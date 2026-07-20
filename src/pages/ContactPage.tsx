import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Mail, Phone, MapPin } from 'lucide-react'
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
    // Send auto-reply email via Resend
    fetch('/api/send-contact-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {}) // silent fail — message already saved
    toast.success('Message sent! We\'ll reply within 24 hours.')
    reset()
  }

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white'

  return (
    <>
      <SEOHead title="Contact Us" url="https://www.meenarajwada.com/contact" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <p className="section-label">Get in Touch</p>
          <h1 className="section-title">Contact Us</h1>
          <div className="divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'support@meenarajwada.com' },
              { icon: Phone, label: 'WhatsApp', value: '+91 63044 24767' },
              { icon: MapPin, label: 'Location', value: 'Delivered pan-India' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input {...register('name')} placeholder="Your Name" className={inputCls} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <input {...register('phone')} type="tel" placeholder="Mobile Number" className={inputCls} maxLength={10} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <input {...register('email')} type="email" placeholder="Email" className={inputCls} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <input {...register('subject')} placeholder="Subject" className={inputCls} />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <textarea {...register('message')} rows={5} placeholder="Your message…" className={`${inputCls} resize-none`} />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
