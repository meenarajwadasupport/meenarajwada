import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Play, Loader2, Image, X, Settings2, Droplets } from 'lucide-react'
import { toast } from 'sonner'

declare global { interface Window { GIF: any } }

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'] as const

const DEFAULTS = {
  fps: 10,
  quality: 5,       // gif.js: 1-30 (lower = better quality but slower)
  width: 480,       // output pixel width
  startTime: 0,
  duration: 5,
  watermark: 'Meena Rajwada',
  watermarkEnabled: true,
  watermarkColor: '#ffffff',
  watermarkPosition: 'bottom-right' as typeof POSITIONS[number],
  fontSize: 20,
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

async function loadGifJs(): Promise<void> {
  if (window.GIF) return
  // Load gif.js from CDN
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load gif.js from CDN'))
    document.head.appendChild(s)
  })
}

async function getWorkerBlobUrl(): Promise<string> {
  try {
    const resp = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')
    const text = await resp.text()
    const blob = new Blob([text], { type: 'application/javascript' })
    return URL.createObjectURL(blob)
  } catch {
    // fallback to direct CDN URL (may not work in all browsers due to CORS worker restriction)
    return 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
  }
}

export default function AdminVideoToGif() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [gifSize, setGifSize] = useState(0)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [settings, setSettings] = useState({ ...DEFAULTS })
  const [dragging, setDragging] = useState(false)
  const [workerUrl, setWorkerUrl] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const gifRef = useRef<any>(null)

  const set = (key: string, val: any) => setSettings(s => ({ ...s, [key]: val }))

  function selectFile(file: File) {
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return }
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
    setGifUrl('')
    setGifSize(0)
    setProgress(0)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) selectFile(file)
  }, [])

  function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!settings.watermarkEnabled || !settings.watermark.trim()) return
    const size = settings.fontSize
    ctx.save()
    ctx.font = `bold ${size}px 'Cormorant Garamond', Georgia, serif`
    ctx.textBaseline = 'alphabetic'
    const tw = ctx.measureText(settings.watermark).width
    const pad = 12
    let x = 0, y = 0
    switch (settings.watermarkPosition) {
      case 'bottom-right': x = w - tw - pad; y = h - pad; break
      case 'bottom-left':  x = pad; y = h - pad; break
      case 'top-right':    x = w - tw - pad; y = size + pad; break
      case 'top-left':     x = pad; y = size + pad; break
      case 'center':       x = (w - tw) / 2; y = h / 2; break
    }
    // Shadow/stroke for readability
    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.lineWidth = Math.max(2, size / 8)
    ctx.strokeText(settings.watermark, x, y)
    ctx.fillStyle = settings.watermarkColor
    ctx.fillText(settings.watermark, x, y)
    ctx.restore()
  }

  async function convert() {
    if (!videoRef.current || !canvasRef.current || !videoFile) return
    const video = videoRef.current
    const canvas = canvasRef.current

    try {
      setConverting(true)
      setProgress(0)
      setGifUrl('')

      setProgressLabel('Loading GIF encoder…')
      await loadGifJs()

      let wUrl = workerUrl
      if (!wUrl) {
        setProgressLabel('Loading worker…')
        wUrl = await getWorkerBlobUrl()
        setWorkerUrl(wUrl)
      }

      // Set canvas size (keep aspect ratio)
      const aspect = video.videoHeight / video.videoWidth
      canvas.width = settings.width
      canvas.height = Math.round(settings.width * aspect)
      const ctx = canvas.getContext('2d')!

      const frameDelay = Math.round(1000 / settings.fps)
      const totalFrames = Math.min(200, Math.round(settings.duration * settings.fps)) // cap at 200 frames
      const frameInterval = 1 / settings.fps

      setProgressLabel('Extracting frames…')

      const gif = new window.GIF({
        workers: 2,
        quality: settings.quality,
        width: canvas.width,
        height: canvas.height,
        workerScript: wUrl,
        repeat: 0,
      })
      gifRef.current = gif

      // Seek video to start
      video.currentTime = settings.startTime
      await new Promise<void>(r => { video.addEventListener('seeked', () => r(), { once: true }) })

      for (let i = 0; i < totalFrames; i++) {
        video.currentTime = settings.startTime + i * frameInterval
        await new Promise<void>(r => { video.addEventListener('seeked', () => r(), { once: true }) })
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        drawWatermark(ctx, canvas.width, canvas.height)
        gif.addFrame(ctx, { copy: true, delay: frameDelay })
        setProgress(Math.round(((i + 1) / totalFrames) * 60))
        setProgressLabel(`Extracting frame ${i + 1} / ${totalFrames}…`)
      }

      setProgressLabel('Encoding GIF…')

      gif.on('progress', (p: number) => {
        setProgress(60 + Math.round(p * 40))
        setProgressLabel(`Encoding GIF… ${Math.round(p * 100)}%`)
      })

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        setGifUrl(url)
        setGifSize(blob.size)
        setConverting(false)
        setProgress(100)
        setProgressLabel('Done!')
        toast.success(`GIF created! ${formatBytes(blob.size)}`)
      })

      gif.render()

    } catch (e: any) {
      toast.error(e.message ?? 'Conversion failed')
      setConverting(false)
      setProgressLabel('')
    }
  }

  function cancelConvert() {
    gifRef.current?.abort?.()
    setConverting(false)
    setProgress(0)
    setProgressLabel('')
  }

  function downloadGif() {
    if (!gifUrl) return
    const a = document.createElement('a')
    a.href = gifUrl
    const baseName = videoFile?.name.replace(/\.[^.]+$/, '') ?? 'meena-rajwada'
    a.download = `${baseName}.gif`
    a.click()
  }

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold">Video → GIF Converter</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Convert product videos to lightweight GIFs with Meena Rajwada watermark
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
          <p className="font-semibold text-foreground">Drop a video here, or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">MP4, MOV, WebM, AVI — any size</p>
          <input ref={fileRef} type="file" accept="video/*" className="hidden"
            onChange={e => e.target.files?.[0] && selectFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {/* Left: Video preview + settings */}
          <div className="space-y-4">

            {/* Video preview */}
            <div className="bg-black rounded-2xl overflow-hidden relative">
              <video ref={videoRef} src={videoUrl} controls className="w-full max-h-64 object-contain" />
              <button onClick={() => { setVideoUrl(''); setVideoFile(null); setGifUrl('') }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {videoFile && (
              <p className="text-xs text-muted-foreground">
                {videoFile.name} · {formatBytes(videoFile.size)}
              </p>
            )}

            {/* Settings */}
            <div className="bg-white border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Settings2 className="w-4 h-4 text-primary" /> Settings
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Start Time (sec)</label>
                  <input type="number" value={settings.startTime} min={0} step={0.1}
                    onChange={e => set('startTime', Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Duration (sec)</label>
                  <input type="number" value={settings.duration} min={1} max={30} step={0.5}
                    onChange={e => set('duration', Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">FPS (frames/sec)</label>
                  <select value={settings.fps} onChange={e => set('fps', Number(e.target.value))} className={inputCls}>
                    {[5, 8, 10, 12, 15, 20].map(v => <option key={v} value={v}>{v} fps</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Output Width (px)</label>
                  <select value={settings.width} onChange={e => set('width', Number(e.target.value))} className={inputCls}>
                    {[240, 320, 480, 600, 720].map(v => <option key={v} value={v}>{v}px</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Quality (1=best, 10=fast)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={30} value={settings.quality}
                    onChange={e => set('quality', Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="text-sm font-bold w-6 text-center">{settings.quality}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Lower = better quality + larger file. Higher = smaller file + faster.</p>
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
                        placeholder="Meena Rajwada" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={settings.watermarkColor}
                            onChange={e => set('watermarkColor', e.target.value)}
                            className="w-10 h-9 rounded border border-border cursor-pointer" />
                          <input value={settings.watermarkColor} onChange={e => set('watermarkColor', e.target.value)}
                            className={`${inputCls} flex-1`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-1">Font size (px)</label>
                        <input type="number" value={settings.fontSize} min={10} max={60}
                          onChange={e => set('fontSize', Number(e.target.value))} className={inputCls} />
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
                                : 'border-border hover:border-primary text-foreground/70'
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

          {/* Right: Output + Convert button */}
          <div className="space-y-4">

            {/* GIF preview */}
            {gifUrl ? (
              <div className="bg-black rounded-2xl overflow-hidden">
                <img src={gifUrl} alt="Output GIF" className="w-full object-contain max-h-64" />
              </div>
            ) : (
              <div className="bg-background border-2 border-dashed border-border rounded-2xl h-64 flex flex-col items-center justify-center gap-2">
                <Image className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">GIF preview will appear here</p>
              </div>
            )}

            {/* Size comparison */}
            {gifUrl && videoFile && (
              <div className="bg-white border border-border rounded-xl p-4">
                <p className="text-xs font-semibold mb-3">Size Comparison</p>
                <div className="space-y-2">
                  {[
                    { label: 'Original Video', size: videoFile.size, color: 'bg-red-400' },
                    { label: 'Output GIF',      size: gifSize,        color: 'bg-green-500' },
                  ].map(({ label, size, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <p className="text-xs w-28 text-muted-foreground">{label}</p>
                      <div className="flex-1 bg-background rounded-full h-2">
                        <div className={`h-2 rounded-full ${color} transition-all`}
                          style={{ width: `${(size / Math.max(videoFile.size, gifSize)) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-16 text-right">{formatBytes(size)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {((1 - gifSize / videoFile.size) * 100).toFixed(0)}% smaller than original
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
                  <button onClick={cancelConvert} className="text-xs text-red-500 hover:underline">Cancel</button>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{progress}%</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={convert}
                disabled={converting || !videoFile}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 font-semibold"
              >
                {converting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting…</>
                  : <><Play className="w-4 h-4" /> Convert to GIF</>
                }
              </button>
              {gifUrl && (
                <button onClick={downloadGif}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Tips for smaller GIFs:</p>
              <p>• Lower FPS (5-10) = smaller file</p>
              <p>• Shorter duration (3-5 sec) = much smaller</p>
              <p>• Lower width (320px) = very small file</p>
              <p>• Higher quality number = smaller file (but less quality)</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
