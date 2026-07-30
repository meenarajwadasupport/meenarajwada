import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Video, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'image/gif']
const ACCEPTED_EXT = '.mp4, .webm, .gif'

interface Props {
  value: string
  onChange: (url: string) => void
  bucket: string
  folder?: string
  label?: string
}

function isBucketMissing(err: any): boolean {
  const msg = (err?.message ?? err?.error ?? '').toLowerCase()
  return msg.includes('bucket not found') || msg.includes('no such bucket') || err?.statusCode === 404
}

async function uploadVideo(bucket: string, path: string, file: File): Promise<string> {
  let { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: true })

  if (error && isBucketMissing(error)) {
    try {
      const apiRes = await fetch('/api/setup-storage', { method: 'POST' })
      if (apiRes.ok) {
        const retry = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type, upsert: true })
        data = retry.data
        error = retry.error
      } else {
        throw new Error('api_failed')
      }
    } catch {
      throw new Error(
        `Storage bucket "${bucket}" not found.\n\n` +
        `Fix: Go to Supabase → Storage → New bucket → name it "${bucket}" → enable Public → Save.`
      )
    }
  }

  if (error) throw error
  if (!data) throw new Error('Upload failed — no data returned')
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

export default function VideoUpload({
  value, onChange, bucket, folder = '', label = 'Video',
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`Only MP4, WebM, or GIF files are supported`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File too large — maximum is ${MAX_SIZE_MB} MB (free Supabase plan limit)`)
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'mp4'
      const prefix = folder ? `${folder}/` : ''
      const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const publicUrl = await uploadVideo(bucket, path, file)
      onChange(publicUrl)

      // Verify the URL is actually publicly accessible
      try {
        const check = await fetch(publicUrl, { method: 'HEAD' })
        if (!check.ok) {
          toast.warning(
            '⚠️ Video saved but not visible — your Supabase storage bucket is private. ' +
            'Fix: Supabase Dashboard → Storage → Buckets → "media" → click ··· → Edit → turn ON Public → Save.',
            { duration: 20000 }
          )
        } else {
          toast.success('Video uploaded and publicly accessible ✓')
        }
      } catch {
        toast.success('Video uploaded ✓')
      }
    } catch (e: any) {
      console.error('VideoUpload error:', e)
      const firstLine = (e.message ?? 'Upload failed').split('\n')[0]
      toast.error(firstLine, { duration: 6000 })
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
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-black">
          {/\.gif(\?|$)/i.test(value) ? (
            // GIF preview — must use <img>, not <video>
            <img src={value} alt="GIF preview" className="w-full aspect-video object-cover" />
          ) : (
            <video
              src={value}
              muted
              loop
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-background transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-600 transition-colors"
            >
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
            'aspect-video w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50',
            uploading ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <Video className="w-7 h-7 text-muted-foreground" />
              <div className="text-center px-4">
                <p className="text-xs font-medium text-foreground">Click or drag to upload video</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ACCEPTED_EXT} · Max {MAX_SIZE_MB} MB</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                <p className="text-[10px] text-amber-700">Keep videos small — free plan has 1 GB total storage</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}
