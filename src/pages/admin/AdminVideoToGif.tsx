import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Play, Loader2, Image, X, Settings2, Droplets } from 'lucide-react'
import { toast } from 'sonner'
import { encodeAnimatedGIF, type GifFrame } from '@/lib/gifEncoder'

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'] as const

const DEFAULTS = {
  fps: 8,
  numColors: 128,
  width: 320,
  startTime: 0,
  duration: 4,
  watermark: 'Meena Rajwada',
  watermarkEnabled: true,
  watermarkColor: '#ffffff',
  watermarkPosition: 'bottom-right' as typeof POSITIONS[number],
  fontSize: 18,
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

// Yield to UI between heavy ops
function yieldToUI() { return new Promise<void>(r => setTimeout(r, 0)) }

// Wait for video metadata to be ready
function waitForMetadata(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    if (video.readyState >= 1) { resolve(); return }
    const ok = () => { video.removeEventListener('loadedmetadata', ok); video.removeEventListener('error', fail); resolve() }
    const fail = () => { video.removeEventListener('loadedmetadata', ok); video.removeEventListener('error', fail); reject(new Error('Video failed to load')) }
    video.addEventListener('loadedmetadata', ok)
    video.addEventListener('error', fail)
  })
}

// Seek video and wait for seeked event
function seekTo(video: HTMLVideoElement, t: number) {
  return new Promise<void>(r => {
    const handler = () => { video.removeEventListener('seeked', handler); r() }
    video.addEventListener('seeked', handler)
    video.currentTime = t
  })
}

export default function AdminVideoToGif() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [gifBlob, setGifBlob] = useState<Blob | null>(null)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [settings, setSettings] = useState({ ...DEFAULTS })
  const [dragging, setDragging] = useState(false)
  const abortRef = useRef(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: string, val: any) => setSettings(s => ({ ...s, [key]: val }))

  function selectFile(file: File) {
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return }
    setVideoFile(file); setVideoUrl(URL.createObjectURL(file))
    setGifUrl(''); setGifBlob(null); setProgress(0)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) selectFile(file)
  }, [])

  function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!settings.watermarkEnabled || !settings.watermark.trim()) return
    const fs = settings.fontSize
    ctx.save()
    ctx.font = `bold ${fs}px 'Cormorant Garamond', Georgia, serif`
    ctx.textBaseline = 'alphabetic'
    const tw = ctx.measureText(settings.watermark).width
    const pad = 10
    let x = 0, y = 0
    switch (settings.watermarkPosition) {
      case 'bottom-right': x = w - tw - pad; y = h - pad; break
      case 'bottom-left':  x = pad;           y = h - pad; break
      case 'top-right':    x = w - tw - pad;  y = fs + pad; break
      case 'top-left':     x = pad;           y = fs + pad; break
      case 'center':       x = (w - tw) / 2;  y = h / 2;   break
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = Math.max(2, fs / 7)
    ctx.strokeText(settings.watermark, x, y)
    ctx.fillStyle = settings.watermarkColor
    ctx.fillText(settings.watermark, x, y)
    ctx.restore()
  }

  async function convert() {
    if (!videoRef.current || !canvasRef.current || !videoFile) return
    const video = videoRef.current
    const canvas = canvasRef.current
    abortRef.current = false

    try {
      setConverting(true); setProgress(0); setGifUrl(''); setGifBlob(null)

      // Wait for video metadata, then seek to start
      setProgressLabel('Loading video…')
      await waitForMetadata(video)
      await seekTo(video, settings.startTime)

      const aspect = video.videoHeight / video.videoWidth || 0.75
      canvas.width = settings.width
      canvas.height = Math.round(settings.width * aspect)
      const ctx = canvas.getContext('2d')!

      const frameDelay = 1000 / settings.fps
      const totalFrames = Math.min(150, Math.round(settings.duration * settings.fps))

      setProgressLabel('Extracting frames…')
      const frames: GifFrame[] = []

      for (let i = 0; i < totalFrames; i++) {
        if (abortRef.current) { setConverting(false); return }

        const t = settings.startTime + (i / settings.fps)
        await seekTo(video, t)

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        drawWatermark(ctx, canvas.width, canvas.height)

        frames.push({
          imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
          delay: frameDelay,
        })

        const pct = Math.round(((i + 1) / totalFrames) * 70)
        setProgress(pct)
        setProgressLabel(`Frame ${i + 1} / ${totalFrames}`)
        if (i % 3 === 0) await yieldToUI()
      }

      if (abortRef.current) { setConverting(false); return }

      setProgressLabel('Building GIF…')
      setProgress(72)
      await yieldToUI()

      const blob = await encodeAnimatedGIF(frames, {
        loop: 0,
        numColors: settings.numColors,
        onProgress: (done, total) => {
          const pct = 72 + Math.round((done / total) * 25)
          setProgress(pct)
          setProgressLabel(`Encoding frame ${done} / ${total}`)
        },
      })

      setProgress(98)
      await yieldToUI()

      const url = URL.createObjectURL(blob)
      setGifUrl(url); setGifBlob(blob)
      setProgress(100); setProgressLabel('Done!')
      toast.success(`GIF created! ${formatBytes(blob.size)}`)
    } catch (e: any) {
      toast.error(e.message ?? 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  function downloadGif() {
    if (!gifBlob || !videoFile) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(gifBlob)
    a.download = videoFile.name.replace(/\.[^.]+$/, '') + '.gif'
    a.click()
  }

  const inp = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="space-y-5 max-w-4xl">

      <div>
        <h1 className="font-serif text-2xl font-bold">Video → GIF Converter</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Convert product videos to lightweight GIFs with Meena Rajwada watermark — no internet needed
        </p>
      </div>

      {/* Upload zone */}
      {!videoUrl ? (
        <div
          onDragEnter={e => { e.preventDefault(); setDragging(true) }}
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 cursor-pointer transition-all ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-background'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold">Drop a video here or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">MP4, MOV, WebM, AVI</p>
          <input ref={fileRef} type="file" accept="video/*" className="hidden"
            onChange={e => e.target.files?.[0] && selectFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {/* Left: Video + settings */}
          <div className="space-y-4">

            <div className="bg-black rounded-2xl overflow-hidden relative">
              <video ref={videoRef} src={videoUrl} controls className="w-full max-h-64 object-contain" />
              <button onClick={() => { setVideoUrl(''); setVideoFile(null); setGifUrl('') }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80">
                <X className="w-4 h-4" />
              </button>
            </div>
            {videoFile && (
              <p className="text-xs text-muted-foreground">{videoFile.name} · {formatBytes(videoFile.size)}</p>
            )}

            {/* Settings */}
            <div className="bg-white border border-border rounded-2xl p-4 space-y-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Settings2 className="w-4 h-4 text-primary" /> Settings
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Start (sec)</label>
                  <input type="number" value={settings.startTime} min={0} step={0.5}
                    onChange={e => set('startTime', Number(e.target.value))} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Duration (sec)</label>
                  <input type="number" value={settings.duration} min={1} max={20} step={0.5}
                    onChange={e => set('duration', Number(e.target.value))} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">FPS</label>
                  <select value={settings.fps} onChange={e => set('fps', Number(e.target.value))} className={inp}>
                    {[5, 6, 8, 10, 12, 15].map(v => <option key={v} value={v}>{v} fps</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Width (px)</label>
                  <select value={settings.width} onChange={e => set('width', Number(e.target.value))} className={inp}>
                    <option value={240}>240px — Fastest / smallest</option>
                    <option value={320}>320px — Fast (recommended)</option>
                    <option value={400}>400px — Balanced</option>
                    <option value={480}>480px — Good quality (slower)</option>
                    <option value={560}>560px — High quality (slow)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">
                    Colors: {settings.numColors} {settings.numColors <= 64 ? '(small file)' : settings.numColors >= 192 ? '(best quality)' : '(balanced)'}
                  </label>
                  <select value={settings.numColors} onChange={e => set('numColors', Number(e.target.value))} className={inp}>
                    <option value={32}>32 — Very small file</option>
                    <option value={64}>64 — Small file</option>
                    <option value={128}>128 — Balanced (recommended)</option>
                    <option value={192}>192 — Good quality</option>
                    <option value={256}>256 — Best quality (larger file)</option>
                  </select>
                </div>
              </div>

              {/* Watermark */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Watermark</span>
                  <label className="ml-auto flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={settings.watermarkEnabled}
                      onChange={e => set('watermarkEnabled', e.target.checked)} className="accent-primary" />
                    Enable
                  </label>
                </div>
                {settings.watermarkEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Text</label>
                      <input value={settings.watermark} onChange={e => set('watermark', e.target.value)}
                        placeholder="Meena Rajwada" className={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={settings.watermarkColor}
                            onChange={e => set('watermarkColor', e.target.value)}
                            className="w-10 h-9 rounded border border-border cursor-pointer flex-shrink-0" />
                          <input value={settings.watermarkColor} onChange={e => set('watermarkColor', e.target.value)}
                            className={`${inp} flex-1`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Size (px)</label>
                        <input type="number" value={settings.fontSize} min={10} max={60}
                          onChange={e => set('fontSize', Number(e.target.value))} className={inp} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Position</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {POSITIONS.map(pos => (
                          <button key={pos} onClick={() => set('watermarkPosition', pos)}
                            className={`text-[10px] px-2 py-1.5 rounded-lg border capitalize transition-colors ${
                              settings.watermarkPosition === pos
                                ? 'bg-primary text-white border-primary'
                                : 'border-border hover:border-primary/50'
                            }`}>
                            {pos.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Output */}
          <div className="space-y-4">

            {/* Preview */}
            {gifUrl ? (
              <div className="bg-black rounded-2xl overflow-hidden">
                <img src={gifUrl} alt="Output GIF" className="w-full max-h-64 object-contain" />
              </div>
            ) : (
              <div className="bg-background border-2 border-dashed border-border rounded-2xl h-64 flex flex-col items-center justify-center gap-2">
                <Image className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">GIF preview will appear here</p>
              </div>
            )}

            {/* Size comparison */}
            {gifBlob && videoFile && (
              <div className="bg-white border border-border rounded-xl p-4">
                <p className="text-xs font-semibold mb-3">Size Comparison</p>
                {[
                  { label: 'Original Video', size: videoFile.size, color: 'bg-red-400' },
                  { label: 'Output GIF',      size: gifBlob.size,  color: 'bg-green-500' },
                ].map(({ label, size, color }) => (
                  <div key={label} className="flex items-center gap-3 mb-2">
                    <p className="text-xs w-28 text-muted-foreground">{label}</p>
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div className={`h-2 rounded-full ${color}`}
                        style={{ width: `${(size / Math.max(videoFile.size, gifBlob.size)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold w-16 text-right">{formatBytes(size)}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {((1 - gifBlob.size / videoFile.size) * 100).toFixed(0)}% smaller than original
                </p>
              </div>
            )}

            {/* Progress */}
            {converting && (
              <div className="bg-white border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm font-medium">{progressLabel}</p>
                  </div>
                  <button onClick={() => { abortRef.current = true }} className="text-xs text-red-500 hover:underline">Cancel</button>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{progress}%</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={convert} disabled={converting || !videoFile}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 font-semibold">
                {converting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting…</>
                  : <><Play className="w-4 h-4" /> Convert to GIF</>}
              </button>
              {gifBlob && (
                <button onClick={downloadGif}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Tips for smaller GIFs:</p>
              <p>• Lower FPS (5-8) = smaller file, still smooth</p>
              <p>• Shorter duration (3-4 sec) = much smaller</p>
              <p>• 320-400px width = good size for web use</p>
              <p>• 128 colors = great balance of quality & size</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
