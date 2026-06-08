const fs = require('fs')
const { Delaunay } = require('d3-delaunay')
const polygonClipping = require('polygon-clipping')

// ── 1. Extract area centroids from bangalore.ts (stay in sync with the data) ──
const src = fs.readFileSync('src/data/bangalore.ts', 'utf8')
const centroids = []
const re = /id:\s*'([^']+)'[^}]*?lng:\s*([\d.]+),\s*lat:\s*([\d.]+)/g
let m
while ((m = re.exec(src))) {
  if (m[1].startsWith('blr-')) centroids.push({ id: m[1], lng: +m[2], lat: +m[3] })
}
console.error('centroids:', centroids.length)

// ── 2. Load + simplify the city boundary ──
const boundary = JSON.parse(fs.readFileSync('scripts/bengaluru-boundary.geojson', 'utf8')) // GeoJSON Polygon
function dp(points, eps) {
  if (points.length < 3) return points
  let dmax = 0, idx = 0
  const [ax, ay] = points[0], [bx, by] = points[points.length - 1]
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i]
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy) || 1e-9
    const d = Math.abs((px - ax) * dy - (py - ay) * dx) / len
    if (d > dmax) { dmax = d; idx = i }
  }
  if (dmax > eps) {
    const l = dp(points.slice(0, idx + 1), eps)
    const r = dp(points.slice(idx), eps)
    return l.slice(0, -1).concat(r)
  }
  return [points[0], points[points.length - 1]]
}
function simplifyClosed(ring, eps) {
  const r = ring.slice(0, ring.length - 1) // drop duplicate closing point
  let fi = 0, fd = -1
  for (let i = 1; i < r.length; i++) {
    const d = Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1])
    if (d > fd) { fd = d; fi = i }
  }
  const a = dp(r.slice(0, fi + 1), eps)
  const b = dp(r.slice(fi), eps)
  const merged = a.slice(0, -1).concat(b)
  merged.push(r[0])
  return merged
}
const simpRing = simplifyClosed(boundary.coordinates[0], 0.0009)
console.error('boundary pts', boundary.coordinates[0].length, '->', simpRing.length)
const boundaryPoly = [simpRing] // polygon-clipping Polygon = Ring[]

// ── 3. Voronoi clipped to boundary ──
const pts = centroids.map(c => [c.lng, c.lat])
const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
const pad = 0.05
const bounds = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad]
const voronoi = Delaunay.from(pts).voronoi(bounds)

const round = (x) => Math.round(x * 1e5) / 1e5
const ringArea = (ring) => {
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  return Math.abs(a / 2)
}

const out = {}
centroids.forEach((c, i) => {
  const cell = voronoi.cellPolygon(i) // closed ring [[x,y]...]
  if (!cell) { console.error('no cell', c.id); return }
  const clipped = polygonClipping.intersection([cell], boundaryPoly) // MultiPolygon
  if (!clipped.length) { console.error('no clip', c.id); return }
  // pick the largest resulting polygon, keep its outer ring only (drop holes)
  let best = null, bestA = -1
  for (const poly of clipped) {
    const a = ringArea(poly[0])
    if (a > bestA) { bestA = a; best = poly }
  }
  const ring = best[0].map(([x, y]) => [round(x), round(y)])
  // ensure closed
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0])
  out[c.id] = [ring]
})

// ── 4. Emit TS ──
const body = Object.entries(out)
  .map(([id, poly]) => `  '${id}': ${JSON.stringify(poly)},`)
  .join('\n')
const ts = `// AUTO-GENERATED — do not edit by hand.
// Voronoi tessellation of the Bengaluru area centroids in bangalore.ts, each
// cell clipped to the real OSM Bengaluru administrative boundary. Regenerate
// with: node scripts/gen-bangalore-polygons.cjs  (after changing centroids).
export const BANGALORE_POLYGONS: Record<string, number[][][]> = {
${body}
}
`
fs.writeFileSync('src/data/bangalorePolygons.ts', ts)
console.error('wrote', Object.keys(out).length, 'polygons')
