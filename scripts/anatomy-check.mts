// Self-check for the Body Explorer rules.   node scripts/anatomy-check.mts
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { classifyTissue, regionOf, searchIndex, normalize, baseName, sideOf, isJunk, type SearchEntry, type Tissue } from "../lib/anatomy/catalog.ts"
import { fitBox } from "../lib/anatomy/camera.ts"

const idx = JSON.parse(readFileSync(new URL("../public/models/index.json", import.meta.url), "utf8")) as { systems: Record<string, [string, number, number, number, number][]> }
const row = (sys: string, name: string) => {
  const r = idx.systems[sys].find((x) => x[0] === name)
  assert.ok(r, `${name} missing from ${sys}`)
  return { x: r[1], y: r[2] }
}

// tissue by name (material names are not in the index, so these use the name rules)
const T = (sys: any, name: string, mat = "") => classifyTissue(sys, mat, name)
assert.equal(T("muscular", "Biceps brachii.l"), "muscle")
assert.equal(T("muscular", "Calcaneal tendon.l"), "tendon")
assert.equal(T("muscular", "Anserine bursa.r"), "bursa")
assert.equal(T("skeletal", "Humerus.r"), "bone")
assert.equal(T("skeletal", "Costal cartilage of first rib.r"), "cartilage")
assert.equal(T("cardiovascular", "Vertebral artery.l"), "artery")
assert.equal(T("cardiovascular", "Inferior vena cava"), "vein")
assert.equal(T("cardiovascular", "Left ventricle"), "heart")
assert.equal(T("cardiovascular", "Mitral valve"), "valve")
assert.equal(T("nervous", "Abducens nerve (VI).l"), "nerve")
assert.equal(T("nervous", "Angular gyrus.l"), "brain")
assert.equal(T("respiratory", "Superior lobe of right lung"), "lung")
assert.equal(T("digestive", "Anterior lateral segment of liver (VI)"), "liver")
assert.equal(T("lymphatic", "Spleen"), "spleen")
assert.equal(T("urinary", "Kidney.l"), "kidney")
assert.equal(T("cardiovascular", "x", "Pulmonary artery"), "vein")

// regions from the real centres
const R = (sys: string, name: string) => regionOf(sys as any, name, row(sys, name))
assert.equal(R("skeletal", "Humerus.r"), "arm")
assert.equal(R("skeletal", "Capitate bone.l"), "hand")
assert.equal(R("skeletal", "Patella.l"), "leg")
assert.equal(R("skeletal", "Calcaneus.r"), "foot")
assert.equal(R("skeletal", "Frontal bone"), "head")
assert.equal(R("skeletal", "Body of sternum"), "thorax")
assert.equal(R("urinary", "Kidney.l"), "abdomen")
assert.equal(R("skeletal", "Sacrum"), "pelvis")
assert.equal(sideOf("Humerus.r", -0.2), "r")
assert.equal(sideOf("Sacrum", 0), "mid")

// how much of the catalogue ends up as "generic" (should stay small)
const dist: Record<string, number> = {}
let total = 0
const entries: SearchEntry[] = []
for (const [sys, rows] of Object.entries(idx.systems)) {
  for (const [name, x, y] of rows) {
    if (isJunk(name)) continue
    total++
    const tt: Tissue = classifyTissue(sys as any, "", name)
    dist[tt] = (dist[tt] ?? 0) + 1
    entries.push({ key: `${sys}:${name}`, label: name, norm: normalize(baseName(name)), system: sys as any, region: regionOf(sys as any, name, { x, y }), side: sideOf(name, x) })
  }
}
console.log("tissues:", dist)
assert.ok((dist.generic ?? 0) / total < 0.03, "too many generic structures")

// removed structures never reach the catalogue
assert.ok(isJunk("Glans penis") && isJunk("Testis.l") && isJunk("Left testicular artery") && isJunk("Deep dorsal vein of penis"))
assert.ok(!isJunk("Prostate") && !isJunk("Seminal gland.l"))
assert.ok(!entries.some((e) => /penis|testis|testicular|epididym/i.test(e.label)))

// search
assert.match(searchIndex(entries, "bicep")[0].label, /biceps brachii/i)
assert.ok(searchIndex(entries, "femur").length > 0)
assert.equal(searchIndex(entries, "x").length, 0)

// camera fit for a phone in portrait
const fit = fitBox({ min: [-0.335, -0.862, -0.13], max: [0.335, 0.834, 0.14] }, [0, 0, 1], 35, 375 / 812, { top: 0, bottom: 0.12, left: 0, right: 0 })
console.log("phone distance", fit.distance.toFixed(2))
assert.ok(fit.distance > 3.0 && fit.distance < 4.2)

console.log(`ok (${total} structures)`)
