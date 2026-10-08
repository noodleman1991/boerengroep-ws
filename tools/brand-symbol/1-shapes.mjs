// Builds the two shapes of the symbol from the logo: green in front, orange behind.
// Where the logo shows a shape, the shape is taken exactly. Where lettering (or, for orange,
// the green shape) covers it, the edge is continued along the sweep of the swirl: the distance
// of each edge from the middle of its swirl is carried on evenly from where it disappears to
// where it shows again.
import sharp from 'sharp'
const [, , input, outDir] = process.argv
const RW = 720
const { data, info } = await sharp(input).extract({ left: 0, top: 0, width: RW, height: (await sharp(input).metadata()).height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, N = W * H
const G = [0x44, 0xad, 0x39], O = [0xf3, 0x92, 0x08]
const g = new Float32Array(N), o = new Float32Array(N), k = new Float32Array(N)
const gg = G[0] ** 2 + G[1] ** 2 + G[2] ** 2, oo = O[0] ** 2 + O[1] ** 2 + O[2] ** 2, go = G[0] * O[0] + G[1] * O[1] + G[2] * O[2], det = gg * oo - go * go
for (let i = 0; i < N; i++) {
  const r = data[i * 4], gr = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3] / 255
  if (a === 0) continue
  const pg = r * G[0] + gr * G[1] + b * G[2], po = r * O[0] + gr * O[1] + b * O[2]
  let wg = Math.max(0, (pg * oo - po * go) / det), wo = Math.max(0, (po * gg - pg * go) / det)
  const sum = wg + wo
  if (sum > 1) { wg /= sum; wo /= sum }
  g[i] = wg * a; o[i] = wo * a; k[i] = Math.max(0, 1 - wg - wo) * a
}

const NT = 1440, NR = 430, CAP = 60
/** value: 0..1 per pixel, known: 1 where the logo shows it. Returns the completed shape, 0..1 per pixel. */
function complete(cx, cy, value, known) {
  const at = (t, r) => {
    const a = (t / NT) * 2 * Math.PI
    const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r)
    return x < 0 || y < 0 || x >= W || y >= H ? -2 : y * W + x
  }
  const val = new Int8Array(NT * NR), fix = new Uint8Array(NT * NR)
  for (let t = 0; t < NT; t++) for (let r = 0; r < NR; r++) {
    const i = at(t, r), c = t * NR + r
    if (i === -2) { fix[c] = 1; val[c] = 0 } else if (known[i]) { fix[c] = 1; val[c] = value[i] >= 0.5 ? 1 : 0 }
  }
  const sd = new Float32Array(NT * NR)
  for (let round = 0; round < 8; round++) {
    // Along each ray: how far, signed, is each point from the nearest edge of the shape.
    for (let t = 0; t < NT; t++) {
      const base = t * NR
      let last = [-1, -1]
      const dist = new Float32Array(NR).fill(CAP)
      for (let r = 0; r < NR; r++) {
        const c = base + r
        if (round === 0 && !fix[c]) continue
        last[val[c]] = r
        const other = last[1 - val[c]]
        if (other >= 0) dist[r] = Math.min(dist[r], r - other)
      }
      last = [-1, -1]
      for (let r = NR - 1; r >= 0; r--) {
        const c = base + r
        if (round === 0 && !fix[c]) continue
        last[val[c]] = r
        const other = last[1 - val[c]]
        if (other >= 0) dist[r] = Math.min(dist[r], other - r)
      }
      for (let r = 0; r < NR; r++) sd[base + r] = (val[base + r] ? 1 : -1) * (dist[r] - 0.5)
    }
    // Around each circle: across a covered stretch, carry that distance on evenly.
    const hidden = []
    for (let r = 0; r < NR; r++) {
      let start = -1
      for (let t = 0; t < NT; t++) if (fix[t * NR + r]) { start = t; break }
      if (start < 0) { hidden.push(r); continue }
      let t = start
      for (let step = 0; step < NT; ) {
        const next = (t + 1) % NT
        if (fix[next * NR + r]) { t = next; step++; continue }
        let end = next, len = 1
        while (!fix[((end + 1) % NT) * NR + r]) { end = (end + 1) % NT; len++ }
        const a = sd[t * NR + r], b = sd[((end + 1) % NT) * NR + r]
        for (let j = 1; j <= len; j++) val[((t + j) % NT) * NR + r] = a + ((b - a) * j) / (len + 1) > 0 ? 1 : 0
        t = (end + 1) % NT
        step += len + 1
      }
    }
    // A circle that lies wholly under lettering takes what the next circle outwards has at each angle.
    for (const r of hidden.sort((a, b) => b - a)) {
      if (r + 1 >= NR) { for (let t = 0; t < NT; t++) val[t * NR + r] = 0; continue }
      for (let t = 0; t < NT; t++) val[t * NR + r] = val[t * NR + r + 1]
    }
  }
  // (inside the loop above, circles wholly under lettering were skipped; they follow their neighbour)
  const out = new Float32Array(N)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x
    if (known[i]) { out[i] = value[i]; continue }
    const dx = x - cx, dy = y - cy, r = Math.round(Math.hypot(dx, dy))
    if (r >= NR) continue
    const t = (Math.round((Math.atan2(dy, dx) / (2 * Math.PI)) * NT) + NT) % NT
    out[i] = val[t * NR + r]
  }
  // The continued parts get a gentle smoothing, so their edge is as calm as the drawn one.
  const pass = (src) => {
    const kern = [], R = 6
    for (let j = -R; j <= R; j++) kern.push(Math.exp(-(j * j) / (2 * 2.6 * 2.6)))
    const sum = kern.reduce((a, b) => a + b, 0)
    const tmp = new Float32Array(N), res = new Float32Array(N)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let j = -R; j <= R; j++) v += kern[j + R] * src[y * W + Math.min(W - 1, Math.max(0, x + j))]; tmp[y * W + x] = v / sum }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let j = -R; j <= R; j++) v += kern[j + R] * tmp[Math.min(H - 1, Math.max(0, y + j)) * W + x]; res[y * W + x] = v / sum }
    return res
  }
  const soft = pass(out)
  for (let i = 0; i < N; i++) if (!known[i]) out[i] = Math.max(0, Math.min(1, (soft[i] - 0.5) * 3 + 0.5))
  return out
}

// Green is in front: the logo shows it wherever there is no lettering.
const gKnown = new Uint8Array(N), gVal = new Float32Array(N)
for (let i = 0; i < N; i++) if (k[i] <= 0.3) { gKnown[i] = 1; gVal[i] = k[i] > 0 ? g[i] / (1 - k[i]) : g[i] }
const green = complete(380, 287, gVal, gKnown)
// Orange lies behind: the logo shows it only where there is neither lettering nor green.
const oKnown = new Uint8Array(N), oVal = new Float32Array(N)
for (let i = 0; i < N; i++) if (k[i] <= 0.3 && green[i] <= 0.3) { oKnown[i] = 1; oVal[i] = o[i] / Math.max(0.001, 1 - k[i] - g[i]) }
const orange = complete(305, 505, oVal, oKnown)

// The box the two shapes fill, in the logo's own pixels.
{
  let x0 = W, y0 = H, x1 = 0, y1 = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (green[y * W + x] > 0.5 || orange[y * W + x] > 0.5) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  const { writeFileSync } = await import('node:fs')
  writeFileSync(`${outDir}/shape-bbox.json`, JSON.stringify({ x0, y0, x1: x1 + 1, y1: y1 + 1 }))
}

// Written large, black on white, for the curve tracer.
const SCALE = Number(process.env.SCALE || 4)
const write = async (shape, name) => {
  const buf = Buffer.alloc(N)
  for (let i = 0; i < N; i++) buf[i] = Math.round(255 * (1 - Math.max(0, Math.min(1, shape[i]))))
  const big = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).resize({ width: W * SCALE, kernel: 'cubic' }).blur(Number(process.env.BLUR || 1.2)).threshold(128).png().toBuffer()
  await sharp(big).toFile(`${outDir}/${name}.png`)
}
await write(green, 'shape-green')
await write(orange, 'shape-orange')

// A sheet to judge by: the logo, the symbol, and the symbol with the logo's lettering laid back over it.
const sheet = (withLetters) => {
  const buf = Buffer.alloc(N * 3)
  for (let i = 0; i < N; i++) {
    const vg = Math.max(0, Math.min(1, green[i])), vo = Math.max(0, Math.min(1, orange[i])) * (1 - vg)
    for (let c = 0; c < 3; c++) {
      let v = 255 * (1 - vg - vo) + G[c] * vg + O[c] * vo
      if (withLetters) v *= 1 - k[i]
      buf[i * 3 + c] = Math.round(v)
    }
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).extract({ left: 60, top: 70, width: 600, height: 670 }).png().toBuffer()
}
const original = await sharp(input).extract({ left: 60, top: 70, width: 600, height: 670 }).flatten({ background: '#ffffff' }).png().toBuffer()
await sharp({ create: { width: 1840, height: 690, channels: 3, background: '#ffffff' } })
  .composite([{ input: original, left: 10, top: 10 }, { input: await sheet(false), left: 620, top: 10 }, { input: await sheet(true), left: 1230, top: 10 }])
  .jpeg({ quality: 84 }).toFile(`${outDir}/shape-sheet.jpg`)
await sharp(await sheet(false)).resize({ width: 1100, kernel: 'cubic' }).jpeg({ quality: 86 }).toFile(`${outDir}/shape-large.jpg`)
console.log('done', W, H)
