// Makes the version of a logo for dark grounds: black lettering becomes white, the colours
// stay exactly as they are. Every pixel is read as a mix of black with one of the logo's
// colours, and the black part is replaced by white.
//
//   cd packages/cms   (for the `sharp` package)
//   node ../../tools/brand-symbol/logo-on-dark.mjs <logo.png> <out.png> <colour> [<colour> ...]
//
// The colours are the logo's own, as hex, for example 44ad39 f39208.
import sharp from 'sharp'

const [, , input, output, ...hex] = process.argv
const inks = hex.map((h) => [0, 2, 4].map((i) => Number.parseInt(h.replace('#', '').slice(i, i + 2), 16)))
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const out = Buffer.from(data)
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0) continue
  const p = [data[i], data[i + 1], data[i + 2]]
  // How much of each colour is in this pixel, when the rest is black.
  let best = { t: 0, err: Infinity, ink: inks[0] }
  for (const ink of inks) {
    const t = Math.max(0, Math.min(1, (p[0] * ink[0] + p[1] * ink[1] + p[2] * ink[2]) / (ink[0] ** 2 + ink[1] ** 2 + ink[2] ** 2)))
    const err = (p[0] - t * ink[0]) ** 2 + (p[1] - t * ink[1]) ** 2 + (p[2] - t * ink[2]) ** 2
    if (err < best.err) best = { t, err, ink }
  }
  // A pixel that is a mix of two of the colours, without black, stays as it is.
  let between = Infinity
  for (let a = 0; a < inks.length; a++) for (let b = a + 1; b < inks.length; b++) {
    const d = [0, 1, 2].map((c) => inks[b][c] - inks[a][c])
    const s = Math.max(0, Math.min(1, ((p[0] - inks[a][0]) * d[0] + (p[1] - inks[a][1]) * d[1] + (p[2] - inks[a][2]) * d[2]) / (d[0] ** 2 + d[1] ** 2 + d[2] ** 2)))
    between = Math.min(between, (p[0] - inks[a][0] - s * d[0]) ** 2 + (p[1] - inks[a][1] - s * d[1]) ** 2 + (p[2] - inks[a][2] - s * d[2]) ** 2)
  }
  if (between < best.err) continue
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(best.t * best.ink[c] + (1 - best.t) * 255)
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toFile(output)
const meta = await sharp(output).metadata()
console.log('written', output, `${meta.width}x${meta.height}`)
