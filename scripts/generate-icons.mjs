// Renders brand/mark.svg into the PWA / iOS icon set under public/icons.
import sharp from 'sharp'
import { copyFile, mkdir } from 'node:fs/promises'

const MARK = 'brand/mark.svg'
const OUT = 'public/icons'
const BG = '#F6F1E9'

// size: canvas px, scale: fraction of the canvas the mark's height occupies
const TARGETS = [
  { file: 'pwa-64.png', size: 64, scale: 0.78 },
  { file: 'pwa-192.png', size: 192, scale: 0.7 },
  { file: 'pwa-512.png', size: 512, scale: 0.7 },
  { file: 'maskable-512.png', size: 512, scale: 0.52 },
  { file: 'apple-touch-icon-180.png', size: 180, scale: 0.62 },
]

async function render({ file, size, scale }) {
  const markHeight = Math.round(size * scale)
  const mark = await sharp(MARK, { density: 600 }).resize({ height: markHeight }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(`${OUT}/${file}`)
}

await mkdir(OUT, { recursive: true })
await Promise.all(TARGETS.map(render))
await copyFile(MARK, 'public/favicon.svg')
console.log(`wrote ${TARGETS.length} icons to ${OUT}`)
