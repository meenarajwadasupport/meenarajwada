import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
  piece_type: z.string().min(2, 'Describe the piece you want'),
  description: z.string().min(10, 'Give us more details'),
  budget: z.string().min(1, 'Mention your budget range'),
  occasion: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CustomizePage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.from('custom_order_requests').insert(data)
    if (error) { toast.error('Could not submit. Please try again.'); return }
    toast.success('Request received! We\'ll contact you within 24 hours.')
    reset()
  }

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white'
  const errCls = 'text-xs text-red-500 mt-1'

  return (
    <>
      <SEOHead title="Custom Jewellery" description="Commission a one-of-a-kind piece. Tell us your vision and we'll craft it with love." url="https://www.meenarajwada.com/customize" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <p className="section-label">Bespoke</p>
          <h1 className="section-title">Custom Jewellery Request</h1>
          <div className="divider" />
          <p className="text-muted-foreground mt-4 text-sm">Tell us your dream piece and our artisans will bring it to life.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Name</label>
              <input {...register('name')} className={`${inputCls} mt-1`} placeholder="Meena Sharma" />
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile (10 digits)</label>
              <input {...register('phone')} type="tel" className={`${inputCls} mt-1`} placeholder="9876543210" maxLength={10} />
              {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <input {...register('email')} type="email" className={`${inputCls} mt-1`} placeholder="you@email.com" />
              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type of Piece</label>
              <input {...register('piece_type')} className={`${inputCls} mt-1`} placeholder="e.g. Silk thread bangle set" />
              {errors.piece_type && <p className={errCls}>{errors.piece_type.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Budget Range</label>
              <input {...register('budget')} className={`${inputCls} mt-1`} placeholder="e.g. ₹2000–₹5000" />
              {errors.budget && <p className={errCls}>{errors.budget.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Occasion (optional)</label>
              <input {...register('occasion')} className={`${inputCls} mt-1`} placeholder="e.g. Wedding, Diwali gift" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Describe Your Vision</label>
              <textarea {...register('description')} rows={4} className={`${inputCls} mt-1 resize-none`} placeholder="Colours, style, size, materials, inspirations…" />
              {errors.description && <p className={errCls}>{errors.description.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60">
            {isSubmitting ? 'Submitting…' : 'Submit Custom Request'}
          </button>
          <p className="text-xs text-center text-muted-foreground">We'll reach out within 24 hours via WhatsApp or email.</p>
        </form>
      </div>
    </>
  )
}
