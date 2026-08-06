/**
 * Self-contained animated GIF encoder — no external dependencies.
 * Implements GIF89a with LZW compression and color quantization.
 */

export interface GifFrame {
  imageData: ImageData
  delay: number   // ms
}

// ── Color quantization ────────────────────────────────────────────────────────
// Samples pixels from all frames, picks the top maxColors unique (5-bit) colors.

function buildPalette(frames: GifFrame[], maxColors: number): Uint8Array {
  const counts = new Map<number, number>()
  for (const { imageData: f } of frames) {
    const d = f.data
    // Sample every Nth pixel for speed on large frames
    const step = Math.max(4, Math.floor(d.length / 80000) * 4)
    for (let i = 0; i < d.length; i += step) {
      const r = d[i] & 0xF8, g = d[i + 1] & 0xF8, b = d[i + 2] & 0xF8
      const k = (r << 16) | (g << 8) | b
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
  }
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, maxColors)
  const pal = new Uint8Array(maxColors * 3)  // rest = black
  top.forEach(([k], i) => {
    pal[i * 3] = (k >> 16) & 0xFF
    pal[i * 3 + 1] = (k >> 8) & 0xFF
    pal[i * 3 + 2] = k & 0xFF
  })
  return pal
}

// Precompute 5-bit-per-channel (32×32×32) nearest-color lookup table
function buildLUT(palette: Uint8Array, palSize: number): Uint8Array {
  const lut = new Uint8Array(32768)
  for (let r = 0; r < 32; r++) {
    for (let g = 0; g < 32; g++) {
      for (let b = 0; b < 32; b++) {
        const fr = r * 8 + 4, fg = g * 8 + 4, fb = b * 8 + 4
        let best = 0, bd = Infinity
        for (let p = 0; p < palSize; p++) {
          const dr = fr - palette[p * 3], dg = fg - palette[p * 3 + 1], db = fb - palette[p * 3 + 2]
          const dist = dr * dr + dg * dg + db * db
          if (dist < bd) { bd = dist; best = p }
          if (dist === 0) break
        }
        lut[(r << 10) | (g << 5) | b] = best
      }
    }
  }
  return lut
}

// Map frame RGBA pixels → palette indices using lookup table (O(1) per pixel)
function mapIndices(frame: ImageData, lut: Uint8Array): Uint8Array {
  const d = frame.data
  const out = new Uint8Array(frame.width * frame.height)
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    out[j] = lut[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]
  }
  return out
}

// ── LZW encoder ───────────────────────────────────────────────────────────────
// Returns sub-block packed bytes (ready to append after min-code-size byte)

function lzwEncode(indices: Uint8Array, minCode: number): Uint8Array {
  const clearCode = 1 << minCode
  const eoiCode = clearCode + 1

  let codeSize = minCode + 1
  let nextCode = eoiCode + 1

  let buf = 0, bufBits = 0
  const bytes: number[] = []

  function emit(code: number) {
    buf |= code << bufBits
    bufBits += codeSize
    while (bufBits >= 8) { bytes.push(buf & 0xFF); buf >>>= 8; bufBits -= 8 }
  }

  // Open-addressed hash table: maps (prefix, suffix) → code
  // TABLE_N is prime > 2x max possible entries (max ~3838 for 12-bit codes)
  const TABLE_N = 8191
  const hPfx = new Int32Array(TABLE_N).fill(-1)
  const hSfx = new Uint8Array(TABLE_N)
  const hCode = new Int32Array(TABLE_N).fill(-1)

  function dictReset() {
    hCode.fill(-1)
    nextCode = eoiCode + 1
    codeSize = minCode + 1
  }

  function find(p: number, s: number): number {
    let h = ((p * 37 + s) * 1193) % TABLE_N
    for (let t = 0; t < TABLE_N; t++) {
      if (hCode[h] === -1) return -1
      if (hPfx[h] === p && hSfx[h] === s) return hCode[h]
      if (++h === TABLE_N) h = 0
    }
    return -1
  }

  function addEntry(p: number, s: number) {
    if (nextCode > 4095) return
    let h = ((p * 37 + s) * 1193) % TABLE_N
    while (hCode[h] !== -1) { if (++h === TABLE_N) h = 0 }
    hPfx[h] = p; hSfx[h] = s; hCode[h] = nextCode
    if (++nextCode > (1 << codeSize) && codeSize < 12) codeSize++
  }

  emit(clearCode)
  dictReset()

  let pfx = indices[0]
  for (let i = 1; i < indices.length; i++) {
    const s = indices[i]
    const found = find(pfx, s)
    if (found !== -1) {
      pfx = found
    } else {
      emit(pfx)
      if (nextCode <= 4095) addEntry(pfx, s)
      else { emit(clearCode); dictReset() }
      pfx = s
    }
  }
  emit(pfx)
  emit(eoiCode)
  if (bufBits > 0) bytes.push(buf & 0xFF)

  // Pack into GIF sub-blocks (max 255 bytes each)
  const out: number[] = []
  for (let i = 0; i < bytes.length;) {
    const len = Math.min(255, bytes.length - i)
    out.push(len)
    for (let j = 0; j < len; j++) out.push(bytes[i++])
  }
  out.push(0) // block terminator
  return new Uint8Array(out)
}

// ── Main encoder ──────────────────────────────────────────────────────────────

export function encodeAnimatedGIF(
  frames: GifFrame[],
  options: { loop?: number; numColors?: number } = {}
): Blob {
  if (!frames.length) throw new Error('No frames provided')
  const { loop = 0, numColors = 128 } = options
  const { width, height } = frames[0].imageData

  // Clamp palette size to power of 2 (GIF requirement)
  const palBits = Math.max(2, Math.min(8, Math.ceil(Math.log2(Math.max(2, numColors)))))
  const palSize = 1 << palBits   // e.g. 128 → palBits=7 → palSize=128

  // Build palette
  const palette = buildPalette(frames, palSize)
  const lut = buildLUT(palette, palSize)

  // Assemble GIF bytes
  const out: number[] = []

  // ── Header
  out.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61) // "GIF89a"

  // ── Logical Screen Descriptor
  out.push(width & 0xFF, (width >> 8) & 0xFF)
  out.push(height & 0xFF, (height >> 8) & 0xFF)
  out.push(0x80 | (palBits - 1), 0, 0)  // global CT flag | CT size, BG index, pixel aspect

  // ── Global Color Table
  palette.forEach(b => out.push(b))

  // ── Netscape Application Extension (looping)
  out.push(
    0x21, 0xFF, 0x0B,                      // ext, app, block-size
    78, 69, 84, 83, 67, 65, 80, 69, 50, 46, 48, // "NETSCAPE2.0"
    0x03, 0x01,                            // sub-block id
    loop & 0xFF, (loop >> 8) & 0xFF,      // loop count
    0x00                                   // terminator
  )

  // ── Frames
  const minCode = Math.max(2, palBits)

  for (const { imageData, delay } of frames) {
    const delayCs = Math.max(2, Math.round(delay / 10)) // ms → centiseconds

    // Graphic Control Extension
    out.push(0x21, 0xF9, 0x04, 0x00, delayCs & 0xFF, (delayCs >> 8) & 0xFF, 0x00, 0x00)

    // Image Descriptor (full-image, no local CT)
    out.push(0x2C, 0, 0, 0, 0, width & 0xFF, (width >> 8) & 0xFF, height & 0xFF, (height >> 8) & 0xFF, 0x00)

    // Image Data
    out.push(minCode)
    const indices = mapIndices(imageData, lut)
    const compressed = lzwEncode(indices, minCode)
    compressed.forEach(b => out.push(b))
  }

  // ── Trailer
  out.push(0x3B)

  return new Blob([new Uint8Array(out)], { type: 'image/gif' })
}
