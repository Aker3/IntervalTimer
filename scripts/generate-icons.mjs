import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const BG = [0x0b, 0x0c, 0x0c]
const FG = [0xe8, 0xe8, 0xe4]

/** CRC-32 for PNG chunks. */
const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // filter: none
    pixels.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * Draws a segmented ring on a near-black square canvas.
 * Gaps and edges are antialiased with 4x4 supersampling.
 */
function drawIcon(size, { radius, stroke, gaps = 4, gapDeg = 13 }) {
  const px = Buffer.alloc(size * size * 4)
  const c = size / 2
  const outer = radius + stroke / 2
  const inner = radius - stroke / 2
  const gapRad = (gapDeg * Math.PI) / 180
  const segment = (Math.PI * 2 - gaps * gapRad) / gaps
  const samples = 4

  const inRing = (x, y) => {
    const dx = x - c
    const dy = y - c
    const distance = Math.hypot(dx, dy)
    if (distance < inner || distance > outer) return false
    let angle = Math.atan2(dy, dx) + Math.PI / 2 // start at 12 o'clock
    angle = (angle + Math.PI * 2) % (Math.PI * 2)
    const local = angle % (segment + gapRad)
    return local < segment
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const pxX = x + (sx + 0.5) / samples
          const pxY = y + (sy + 0.5) / samples
          if (inRing(pxX, pxY)) hits++
        }
      }
      const alpha = hits / (samples * samples)
      const i = (y * size + x) * 4
      px[i] = Math.round(BG[0] + (FG[0] - BG[0]) * alpha)
      px[i + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * alpha)
      px[i + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * alpha)
      px[i + 3] = 255
    }
  }
  return px
}

const targets = [
  { file: 'icon-192.png', size: 192, radius: 192 * 0.335, stroke: 192 * 0.075 },
  { file: 'icon-512.png', size: 512, radius: 512 * 0.335, stroke: 512 * 0.075 },
  // Maskable icons must keep content inside the 80% safe circle.
  {
    file: 'maskable-512.png',
    size: 512,
    radius: 512 * 0.265,
    stroke: 512 * 0.062,
    gapDeg: 15,
  },
  {
    file: 'apple-touch-icon.png',
    size: 180,
    radius: 180 * 0.335,
    stroke: 180 * 0.075,
  },
]

for (const { file, ...options } of targets) {
  writeFileSync(join(outDir, file), encodePng(options.size, drawIcon(options.size, options)))
  console.log(`wrote public/icons/${file}`)
}
