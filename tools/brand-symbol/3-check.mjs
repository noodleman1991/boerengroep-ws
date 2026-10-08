// Checks the vector symbol against the logo: wherever the logo shows green, orange or nothing
// (that is, wherever there is no lettering), the symbol must show the same.
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
const [, , logo, svgFile, dir] = process.argv
const off = JSON.parse(readFileSync(`${dir}/symbol-offset.json`, 'utf8'))
const left = Math.round(off.left), top = Math.round(off.top)
const L = await sharp(logo).extract({ left, top, width: off.width, height: off.height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const V = await sharp(svgFile, { density: 72 }).resize(off.width, off.height).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const cls = (d, i) => { const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]; if (a < 128) return 'E'; if (r < 70 && g < 70 && b < 70) return 'K'; return g > r ? 'G' : 'O' }
let visible = 0, wrong = 0, covered = 0
const N = off.width * off.height, diff = Buffer.alloc(N * 3, 255)
for (let i = 0; i < N; i++) {
  const a = cls(L.data, i * 4), b = cls(V.data, i * 4)
  const col = b === 'G' ? [66, 173, 55] : b === 'O' ? [242, 143, 6] : [255, 255, 255]
  if (a === 'K') { covered++; for (let c = 0; c < 3; c++) diff[i * 3 + c] = Math.round(col[c] * 0.55 + 120 * 0.45); continue }
  visible++
  if (a !== b) { wrong++; diff[i * 3] = 255; diff[i * 3 + 1] = 0; diff[i * 3 + 2] = 255 } else for (let c = 0; c < 3; c++) diff[i * 3 + c] = col[c]
}
let drawn = 0, redrawn = 0
for (let i = 0; i < N; i++) { const b = cls(V.data, i * 4); if (b === 'G' || b === 'O') { drawn++; if (cls(L.data, i * 4) === 'K') redrawn++ } }
console.log(`visible pixels: ${visible}, different: ${wrong} (${((wrong / visible) * 100).toFixed(2)}%); of the symbol's area ${((redrawn / drawn) * 100).toFixed(0)}% lies under the lettering and is redrawn`)
const big = await sharp(svgFile, { density: 300 }).resize({ height: 900 }).flatten({ background: '#ffffff' }).png().toBuffer()
const bw = (await sharp(big).metadata()).width
const d = await sharp(diff, { raw: { width: off.width, height: off.height, channels: 3 } }).resize({ height: 900, kernel: 'nearest' }).png().toBuffer()
const dw = (await sharp(d).metadata()).width
await sharp({ create: { width: bw + dw + 60, height: 940, channels: 3, background: '#ffffff' } }).composite([{ input: big, left: 20, top: 20 }, { input: d, left: bw + 40, top: 20 }]).jpeg({ quality: 86 }).toFile(`${dir}/symbol-check.jpg`)
