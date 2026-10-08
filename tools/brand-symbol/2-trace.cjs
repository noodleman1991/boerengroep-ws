// Turns the two shapes into smooth outlines and writes one small SVG file.
const potrace = require('potrace')
const fs = require('fs')
const [, , dir, out] = process.argv
const SCALE = Number(process.env.SCALE || 4)
const trace = (file) =>
  new Promise((resolve, reject) =>
    potrace.trace(file, { turdSize: 80, alphaMax: Number(process.env.ALPHA || 1.15), optCurve: true, optTolerance: Number(process.env.TOL || 0.6), threshold: 128 }, (err, svg) => (err ? reject(err) : resolve(svg))),
  )
const pathOf = (svg) => svg.match(/ d="([^"]+)"/)[1]
const numbers = (d) => d.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number)

;(async () => {
  const shapes = { orange: pathOf(await trace(`${dir}/shape-orange.png`)), green: pathOf(await trace(`${dir}/shape-green.png`)) }
  for (const d of Object.values(shapes)) {
    const letters = new Set(d.replace(/[^A-Za-z]/g, '').split(''))
    for (const letter of letters) if (!'MCLZ'.includes(letter)) throw new Error(`unexpected path command ${letter}`)
  }
  // The box around both shapes, in the logo's own pixels, with a little air.
  const box = JSON.parse(fs.readFileSync(`${dir}/shape-bbox.json`, 'utf8'))
  const minX = box.x0, minY = box.y0, maxX = box.x1, maxY = box.y1
  const PAD = 3
  const move = (d) => { let i = 0; return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (n) => { const v = Number(n) / SCALE - (i++ % 2 === 0 ? minX : minY) + PAD; return String(Math.round(v * 10) / 10) }) }
  const w = Math.ceil(maxX - minX + PAD * 2), h = Math.ceil(maxY - minY + PAD * 2)
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `  <path fill="#f28f06" fill-rule="evenodd" d="${move(shapes.orange)}"/>`,
    `  <path fill="#42ad37" fill-rule="evenodd" d="${move(shapes.green)}"/>`,
    `</svg>`,
    '',
  ].join('\n')
  fs.writeFileSync(out, svg)
  fs.writeFileSync(`${dir}/symbol-offset.json`, JSON.stringify({ left: minX - PAD, top: minY - PAD, width: w, height: h }))
  console.log(`symbol ${w}x${h}, ${svg.length} bytes, ${(svg.match(/C/g) || []).length} curves, offset in the logo ${Math.round(minX - PAD)},${Math.round(minY - PAD)}`)
})()
