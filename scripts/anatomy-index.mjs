// Rebuilds public/models/index.json (v2) from the GLB files: one row per structure with its centre and radius,
// so search, regions and the camera can work before any model has loaded.
//   node scripts/anatomy-index.mjs
// Row: [name, cx, cy, cz, radius] in model units (body is about 1.7 tall). Needs no dependencies.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "models")
const ids = ["fascia", "muscular", "cardiovascular", "lymphatic", "nervous", "respiratory", "digestive", "urinary", "reproductive", "endocrine", "joints", "skeletal"]
const r3 = (x) => Math.round(x * 1000) / 1000
const out = { v: 2, systems: {} }
const sizes = {}

for (const id of ids) {
  const buf = readFileSync(path.join(dir, `${id}.glb`))
  sizes[id] = buf.length
  const json = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString("utf8"))
  const rows = []
  for (const node of json.nodes) {
    if (node.mesh === undefined) continue
    const s = node.scale ?? [1, 1, 1]
    const t = node.translation ?? [0, 0, 0]
    const lo = [Infinity, Infinity, Infinity]
    const hi = [-Infinity, -Infinity, -Infinity]
    for (const prim of json.meshes[node.mesh].primitives) {
      const a = json.accessors[prim.attributes.POSITION]
      const k = a.normalized ? (a.componentType === 5122 ? 32767 : a.componentType === 5120 ? 127 : 1) : 1
      for (let i = 0; i < 3; i++) {
        lo[i] = Math.min(lo[i], (a.min[i] / k) * s[i] + t[i])
        hi[i] = Math.max(hi[i], (a.max[i] / k) * s[i] + t[i])
      }
    }
    const c = lo.map((v, i) => (v + hi[i]) / 2)
    const radius = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2
    rows.push([node.extras?.name ?? node.name.replace(/\.\d{3}$/, ""), r3(c[0]), r3(c[1]), r3(c[2]), r3(radius)])
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]))
  out.systems[id] = rows
}
writeFileSync(path.join(dir, "index.json"), JSON.stringify(out))
console.log("rows:", Object.fromEntries(Object.entries(out.systems).map(([k, v]) => [k, v.length])))
console.log("sizes:", sizes)
