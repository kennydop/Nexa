// Generates the demo-mode files (PDFs, images, a short video) in public/demo.
//   node scripts/build-demo-assets.mjs
// Every file is stamped as a demo sample: none are official UCC documents.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import sharp from 'sharp'
import { NOTES, PAPERS } from './demo-content/documents.mjs'

const OUT = 'public/demo'
const STAMP = 'Nexa demo sample - not an official UCC document'
const PLUM = rgb(0.353, 0.165, 0.243)
const BRONZE = rgb(0.722, 0.412, 0.184)
const INK = rgb(0.1, 0.055, 0.086)
const A4 = [595.28, 841.89]
const MARGIN = 56

/* ---------------- PDFs ---------------- */
function wrap(text, font, size, width) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

async function newDoc(title) {
  const doc = await PDFDocument.create()
  doc.setTitle(title)
  doc.setProducer('Nexa demo generator')
  return {
    doc,
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }
}

/** Adds a page with the header band and demo footer; returns a text cursor. */
function addPage(ctx, kicker, title) {
  const page = ctx.doc.addPage(A4)
  const [w, h] = A4
  page.drawRectangle({ x: 0, y: h - 96, width: w, height: 96, color: PLUM })
  page.drawText(kicker.toUpperCase(), { x: MARGIN, y: h - 40, size: 9, font: ctx.bold, color: rgb(0.94, 0.63, 0.38) })
  page.drawText(title, { x: MARGIN, y: h - 66, size: 17, font: ctx.bold, color: rgb(0.97, 0.93, 0.9) })
  page.drawText(STAMP, { x: MARGIN, y: 28, size: 8, font: ctx.regular, color: BRONZE })
  let y = h - 130
  const write = (text, { size = 11, font = ctx.regular, gap = 6, indent = 0, color = INK } = {}) => {
    for (const line of wrap(text, font, size, w - MARGIN * 2 - indent)) {
      page.drawText(line, { x: MARGIN + indent, y, size, font, color })
      y -= size + gap
    }
  }
  return { write, space: (n) => (y -= n) }
}

async function buildPaper(paper) {
  const ctx = await newDoc(`${paper.course} - ${paper.exam}`)
  const { write, space } = addPage(ctx, 'University of Cape Coast · demo past question', paper.course)
  write(paper.exam, { font: ctx.bold, size: 13 })
  write(paper.instructions, { size: 10, color: PLUM })
  space(10)
  let n = 1
  for (const section of paper.sections) {
    write(section.title, { font: ctx.bold, size: 12, color: BRONZE })
    space(2)
    for (const q of section.questions) {
      write(`${n}.  ${q}`, { indent: 0, gap: 5 })
      space(8)
      n += 1
    }
    space(6)
  }
  await writeFile(join(OUT, paper.file), await ctx.doc.save())
}

async function buildNotes(notes) {
  const ctx = await newDoc(notes.title)
  for (const page of notes.pages) {
    const { write, space } = addPage(ctx, `${notes.course} · demo notes`, notes.title)
    write(page.heading, { font: ctx.bold, size: 15, color: PLUM })
    space(8)
    for (const line of page.lines) {
      if (line === '') space(10)
      else write(line, { size: 12, gap: 8 })
    }
  }
  await writeFile(join(OUT, notes.file), await ctx.doc.save())
}

/* ---------------- Images ---------------- */
const svgText = (x, y, text, size = 28, weight = 600, fill = '#1a0e16') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${text}</text>`

function freeBodySvg() {
  const arrow = (x1, y1, x2, y2, label, lx, ly) => `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b8692f" stroke-width="6" marker-end="url(#a)"/>
    ${svgText(lx, ly, label, 26, 700, '#b8692f')}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs><marker id="a" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#b8692f"/></marker></defs>
    <rect width="1200" height="900" fill="#f6f1e9"/>
    ${svgText(60, 80, 'GEN 103 · Free-body diagrams', 40, 800, '#5a2a3e')}
    ${svgText(60, 120, 'Block on a rough incline (angle t)', 26, 500, '#6e5a63')}
    <polygon points="150,760 950,760 950,360" fill="#e8ddd0" stroke="#5a2a3e" stroke-width="4"/>
    <g transform="rotate(-26.6 600 560)"><rect x="520" y="470" width="160" height="110" rx="10" fill="#5a2a3e"/></g>
    ${arrow(600, 545, 600, 720, 'W = mg', 615, 700)}
    ${arrow(600, 545, 520, 385, 'N', 480, 380)}
    ${arrow(600, 545, 780, 455, 'F (friction)', 760, 430)}
    ${svgText(60, 830, 'Resolve along the slope: mg sin t - F = ma.   Perpendicular: N = mg cos t.', 26, 600)}
    ${svgText(60, 870, 'Nexa demo sample - not an official UCC document', 18, 500, '#b8692f')}
  </svg>`
}

function handwrittenPaperSvg() {
  const lines = [
    'CMS 107 Communicative Skills - 2023 (first semester)',
    '1. Summarise the passage in not more than 80 words.',
    '2. Explain FIVE strategies for effective note-taking.',
    '3. Write a formal letter to the Dean of Students on',
    '    the state of lecture halls on campus.',
    '4. Distinguish between a thesis statement and a',
    '    topic sentence, with examples.',
  ]
  const rows = lines.map((l, i) => svgText(90, 200 + i * 78, l, i === 0 ? 34 : 30, i === 0 ? 800 : 500, '#22303f')).join('')
  const rules = Array.from({ length: 12 }, (_, i) => `<line x1="40" x2="1160" y1="${215 + i * 78}" y2="${215 + i * 78}" stroke="#c9d6e8" stroke-width="2"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1100">
    <rect width="1200" height="1100" fill="#fbf8f1"/>
    <line x1="70" x2="70" y1="0" y2="1100" stroke="#f0b4b4" stroke-width="3"/>
    ${rules}${rows}
    ${svgText(90, 1060, 'Photo of a demo paper - not an official UCC document', 22, 600, '#b8692f')}
  </svg>`
}

async function buildImages() {
  await sharp(Buffer.from(freeBodySvg())).webp({ quality: 82 }).toFile(join(OUT, 'gen103-free-body-diagrams.webp'))
  await sharp(Buffer.from(handwrittenPaperSvg()))
    .rotate(-1.2, { background: '#d9d2c5' })
    .modulate({ brightness: 0.97 })
    .webp({ quality: 80 })
    .toFile(join(OUT, 'cms107-2023-s1-photo.webp'))
}

/* ---------------- Video ---------------- */
const SLIDES = [
  ['GEN 105 · Applied Electricity', "Ohm's law in 60 seconds"],
  ['V = I x R', 'Voltage = current x resistance'],
  ['12 V across 4 ohms', 'I = 12 / 4 = 3 A'],
  ['Double R, halve I', '12 V across 8 ohms gives 1.5 A'],
  ['Power: P = V x I', '12 V x 3 A = 36 W'],
  ['Practise with past questions', 'Nexa demo sample'],
]
const FPS = 24
const SLIDE_SECONDS = 2.5
const [VW, VH] = [1280, 720]

function frameSvg([title, sub], progress, overall) {
  const glow = 0.5 + 0.5 * Math.sin(progress * Math.PI)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VW}" height="${VH}">
    <rect width="${VW}" height="${VH}" fill="#140a12"/>
    <circle cx="${1000 + progress * 60}" cy="140" r="${200 + glow * 30}" fill="#f0a062" opacity="0.18"/>
    <circle cx="200" cy="${640 - progress * 40}" r="140" fill="#34486e" opacity="0.35"/>
    ${svgText(110, 330, title, 72, 800, '#f7eee6')}
    ${svgText(110, 410, sub, 38, 500, '#f0a062')}
    <rect x="110" y="600" width="${(VW - 220) * overall}" height="8" rx="4" fill="#f0a062"/>
    ${svgText(110, 660, 'Nexa demo video - not official UCC material', 22, 500, '#b9a6ae')}
  </svg>`
}

async function buildVideo() {
  const dir = await mkdtemp(join(tmpdir(), 'nexa-frames-'))
  const perSlide = Math.round(FPS * SLIDE_SECONDS)
  const total = perSlide * SLIDES.length
  try {
    for (let i = 0; i < total; i += 1) {
      const slide = SLIDES[Math.floor(i / perSlide)]
      const svg = frameSvg(slide, (i % perSlide) / perSlide, i / total)
      await sharp(Buffer.from(svg)).png().toFile(join(dir, `f${String(i).padStart(4, '0')}.png`))
    }
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%04d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-movflags', '+faststart',
      join(OUT, 'gen105-ohms-law.mp4'),
    ])
    await sharp(join(dir, 'f0012.png')).jpeg({ quality: 78 }).toFile(join(OUT, 'gen105-ohms-law-poster.jpg'))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

await mkdir(OUT, { recursive: true })
await Promise.all([...PAPERS.map(buildPaper), ...NOTES.map(buildNotes), buildImages()])
await buildVideo()
console.log(`wrote ${PAPERS.length} papers, ${NOTES.length} notes, 2 images and 1 video to ${OUT}`)
