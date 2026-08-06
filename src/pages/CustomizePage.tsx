import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

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

/**
 * Compress image to ≤ MAX_DIM px, ≤ target quality, return as base64 data URL.
 * Stored directly in DB — no Storage bucket / auth needed.
 */
async function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_DIM = 900          // max px on longest side
      const TARGET  = 180_000      // ~180 KB base64 target
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM }
        else       { w = Math.round(w * MAX_DIM / h); h = MAX_DIM }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)

      let quality = 0.78
      const attempt = (): void => {
        const b64 = canvas.toDataURL('image/jpeg', quality)
        // b64 length ≈ 4/3 × bytes; keep trying down to quality 0.3
        if (b64.length <= TARGET * (4 / 3) || quality <= 0.3) {
          resolve(b64)
        } else {
          quality -= 0.1
          attempt()
        }
      }
      attempt()
    }
    img.onerror = reject
    img.src = url
  })
}

export default function CustomizePage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [refImage, setRefImage]       = useState<File | null>(null)
  const [refPreview, setRefPreview]   = useState('')
  const [uploading, setUploading]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setRefImage(file)
    setRefPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setRefImage(null)
    if (refPreview) URL.revokeObjectURL(refPreview)
    setRefPreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onSubmit(data: FormData) {
    setUploading(true)
    let refUrl: string | null = null
    if (refImage) {
      try {
        refUrl = await compressToBase64(refImage)
      } catch {
        // compression failed — continue without image
      }
    }
    setUploading(false)

    const basePayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      piece_type: data.piece_type,
      description: data.description,
      budget: data.budget,
      occasion: data.occasion ?? null,
    }

    // Try with image first; if column doesn't exist yet, fall back to without image
    if (refUrl) {
      const { error } = await supabase
        .from('custom_order_requests')
        .insert({ ...basePayload, reference_image_url: refUrl })

      if (error) {
        // Column might not exist — retry without image
        const { error: error2 } = await supabase
          .from('custom_order_requests')
          .insert(basePayload)
        if (error2) {
          toast.error('Could not submit. Please try again.')
          return
        }
        // Submitted OK but image column missing — remind user to run SQL
        toast.success("Request received! We'll contact you within 24 hours.")
        toast.warning('Run SQL to enable image storage: ALTER TABLE custom_order_requests ADD COLUMN IF NOT EXISTS reference_image_url TEXT;')
      } else {
        toast.success("Request received! We'll contact you within 24 hours.")
      }
    } else {
      const { error } = await supabase.from('custom_order_requests').insert(basePayload)
      if (error) { toast.error('Could not submit. Please try again.'); return }
      toast.success("Request received! We'll contact you within 24 hours.")
    }

    reset()
    removeImage()
  }

  const busy = isSubmitting || uploading
  const inp = 'w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary bg-white transition-colors'
  const err = 'text-xs text-red-500 mt-1'

  return (
    <>
      <SEOHead title="Custom Jewellery" description="Commission a one-of-a-kind piece. Tell us your vision and we'll craft it with love." url="https://www.meenarajwada.com/customize" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="section-label">Bespoke</p>
          <h1 className="section-title">Custom Jewellery Request</h1>
          <div className="divider" />
          <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
            Tell us your dream piece and our artisans will bring it to life.<br />
            <span className="text-primary font-medium">We'll reach out within 24 hours.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-5 sm:p-7 space-y-5 shadow-sm">

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Your Name *</label>
              <input {...register('name')} className={inp} placeholder="Meena Sharma" />
              {errors.name && <p className={err}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Mobile (10 digits) *</label>
              <input {...register('phone')} type="tel" className={inp} placeholder="9876543210" maxLength={10} />
              {errors.phone && <p className={err}>{errors.phone.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Email *</label>
            <input {...register('email')} type="email" className={inp} placeholder="you@email.com" />
            {errors.email && <p className={err}>{errors.email.message}</p>}
          </div>

          {/* Piece type + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Type of Piece *</label>
              <input {...register('piece_type')} className={inp} placeholder="e.g. Silk thread bangle set" />
              {errors.piece_type && <p className={err}>{errors.piece_type.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Budget Range *</label>
              <input {...register('budget')} className={inp} placeholder="e.g. ₹2000–₹5000" />
              {errors.budget && <p className={err}>{errors.budget.message}</p>}
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Occasion <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span></label>
            <input {...register('occasion')} className={inp} placeholder="e.g. Wedding, Diwali gift, Anniversary" />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Describe Your Vision *</label>
            <textarea {...register('description')} rows={4} className={`${inp} resize-none`}
              placeholder="Colours, style, size, materials, inspirations… the more detail the better!" />
            {errors.description && <p className={err}>{errors.description.message}</p>}
          </div>

          {/* Reference Image Upload */}
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">
              Reference Image <span className="text-muted-foreground/60 normal-case font-normal">(optional — max 5 MB)</span>
            </label>

            {!refPreview ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 group-hover:bg-primary/12 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-foreground/70">Upload a reference image</p>
                <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP — we'll compress it automatically</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={refPreview} alt="Reference" className="w-full max-h-56 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-[11px] text-white/80 truncate">{refImage?.name}</span>
                  <span className="text-[10px] text-white/50 ml-auto flex-shrink-0">
                    {refImage ? `${(refImage.size / 1024).toFixed(0)} KB → will compress to ≤${MAX_MB} MB` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full py-4 text-[13px] tracking-[0.18em] mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy
              ? <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? 'Uploading image…' : 'Submitting…'}</>
              : 'Submit Custom Request'}
          </button>

          <p className="text-[11px] text-center text-muted-foreground">
            We'll reach out within 24 hours via WhatsApp or email · Your details are secure with us
          </p>
        </form>

        {/* How it works */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Share Your Vision',   desc: 'Fill the form with your design idea and reference image' },
            { step: '02', title: 'We Craft a Quote',    desc: 'Our artisan team reviews and sends you a price in 24 hrs' },
            { step: '03', title: 'Made Just for You',   desc: 'Your piece is handcrafted and delivered in 7–10 days' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white border border-border rounded-2xl p-5 text-center">
              <p className="text-3xl font-serif font-bold text-primary/20 leading-none mb-2">{step}</p>
              <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
