import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (url: string) => void
  bucket: string
  folder?: string
  label?: string
  aspect?: 'square' | 'wide' | 'free'
}

// ── Image compression ────────────────────────────────────────────────────────
async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', quality)
    }
    img.src = url
  })
}

function isBucketMissing(err: any): boolean {
  const msg = (err?.message ?? err?.error ?? '').toLowerCase()
  return msg.includes('bucket not found') || msg.includes('no such bucket') || err?.statusCode === 404
}

// ── Upload with auto-bucket creation ────────────────────────────────────────
async function uploadToStorage(bucket: string, path: string, blob: Blob): Promise<string> {
  let { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: 'image/webp', upsert: true })

  if (error && isBucketMissing(error)) {
    // Step 1: try to create bucket via our server-side API (uses service role)
    try {
      const apiRes = await fetch('/api/setup-storage', { method: 'POST' })
      if (apiRes.ok) {
        // Retry upload after bucket creation
        const retry = await supabase.storage
          .from(bucket)
          .upload(path, blob, { contentType: 'image/webp', upsert: true })
        data = retry.data
        error = retry.error
      } else {
        throw new Error('api_failed')
      }
    } catch {
      // Step 2: show clear manual instructions
      throw new Error(
        `Storage bucket "${bucket}" not found.\n\n` +
        `Fix (30 seconds):\n` +
        `1. Go to supabase.com → your project → Storage\n` +
        `2. Click "New bucket" → name it "${bucket}" → enable Public\n` +
        `3. Click Save, then try uploading again.`
      )
    }
  }

  if (error) throw error
  if (!data) throw new Error('Upload failed — no data returned')
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ImageUpload({
  value, onChange, bucket, folder = '', label = 'Image', aspect = 'free',
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const prefix = folder ? `${folder}/` : ''
      const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const publicUrl = await uploadToStorage(bucket, path, compressed)
      onChange(publicUrl)
      toast.success('Image uploaded ✓')
    } catch (e: any) {
      console.error('ImageUpload error:', e)
      // Multi-line errors: show first line in toast, rest in console
      const firstLine = (e.message ?? 'Upload failed').split('\n')[0]
      toast.error(firstLine, { duration: 6000 })
      if (e.message?.includes('Storage bucket')) {
        console.info('STORAGE SETUP REQUIRED:\n', e.message)
      }
    } finally {
      setUploading(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const aspectClass = aspect === 'square' ? 'aspect-square' : aspect === 'wide' ? 'aspect-video' : 'aspect-[4/3]'

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted">
          <img src={value} alt={label} className={`w-full object-cover ${aspectClass}`} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="bg-white text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-background transition-colors">
              <Upload className="w-3.5 h-3.5" /> Replace
            </button>
            <button type="button" onClick={() => onChange('')}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-600 transition-colors">
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={[
            aspectClass, 'w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50',
            uploading ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {uploading ? (
            <><Loader2 className="w-7 h-7 text-primary animate-spin" /><p className="text-xs text-muted-foreground">Uploading…</p></>
          ) : (
            <><ImageIcon className="w-7 h-7 text-muted-foreground" />
              <div className="text-center px-4">
                <p className="text-xs font-medium text-foreground">Click or drag to upload</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WebP · Auto-compressed</p>
              </div></>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  )
}
