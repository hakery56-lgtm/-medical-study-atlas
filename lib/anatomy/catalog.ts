// Pure data and rules for the Body Explorer (no three.js, no window), so a Node script can check them.
import type { LayerId, SystemId } from "@/data/anatomy-systems"

export type Side = "l" | "r" | "mid"
export type RegionId = "head" | "thorax" | "abdomen" | "pelvis" | "arm" | "hand" | "leg" | "foot"

export type Tissue =
  | "muscle" | "tendon" | "ligament" | "cartilage" | "bone" | "tooth" | "bursa" | "fat" | "fascia" | "membrane"
  | "artery" | "vein" | "heart" | "valve" | "nerve" | "brain" | "neural" | "clear" | "eye"
  | "lymphNode" | "spleen" | "thymus" | "tonsil"
  | "lung" | "airway" | "mucosa" | "liver" | "stomach" | "intestine" | "oesophagus" | "pancreas" | "gallbladder" | "gland"
  | "kidney" | "bladder" | "duct" | "testis" | "erectile" | "thyroid" | "adrenal" | "generic"

// ---------- layers and presets ----------

export const LAYERS: { id: LayerId; label: string; hint: string; systems: SystemId[] }[] = [
  { id: "muscles", label: "Muscles", hint: "All skeletal muscles and tendons", systems: ["muscular"] },
  { id: "skeleton", label: "Skeleton", hint: "Bones and cartilage", systems: ["skeletal"] },
  { id: "joints", label: "Joints & ligaments", hint: "Ligaments, capsules, discs", systems: ["joints"] },
  { id: "organs", label: "Organs", hint: "Lungs, gut, kidneys, glands", systems: ["respiratory", "digestive", "urinary", "reproductive", "endocrine"] },
  { id: "vessels", label: "Vessels & nerves", hint: "Heart, arteries, veins, lymph, brain, nerves", systems: ["cardiovascular", "nervous", "lymphatic"] },
]

export interface Preset { id: string; label: string; systems: SystemId[]; outline: boolean }
export const PRESETS: Preset[] = [
  { id: "muscles", label: "Muscles", systems: ["muscular", "skeletal"], outline: false },
  { id: "vessels", label: "Vessels & nerves", systems: ["cardiovascular", "nervous", "lymphatic", "skeletal"], outline: true },
  { id: "organs", label: "Organs", systems: ["respiratory", "digestive", "urinary", "reproductive", "endocrine", "cardiovascular", "skeletal"], outline: true },
  { id: "skeleton", label: "Skeleton", systems: ["skeletal", "joints"], outline: true },
  { id: "all", label: "Everything", systems: ["muscular", "cardiovascular", "lymphatic", "nervous", "respiratory", "digestive", "urinary", "reproductive", "endocrine", "joints", "skeletal"], outline: false },
]

// ---------- body geometry ----------

// measured from the model files (see scripts/anatomy-index.mjs); front faces +z, the model's right side is -x
export const BODY = { minX: -0.335, maxX: 0.335, minY: -0.862, maxY: 0.834, minZ: -0.13, maxZ: 0.14 }
export const BODY_H = BODY.maxY - BODY.minY
export const BODY_HALF_W = BODY.maxX

export const REGIONS: { id: RegionId; label: string; paired: boolean }[] = [
  { id: "head", label: "Head & neck", paired: false },
  { id: "thorax", label: "Thorax", paired: false },
  { id: "abdomen", label: "Abdomen", paired: false },
  { id: "pelvis", label: "Pelvis", paired: false },
  { id: "arm", label: "Arm", paired: true },
  { id: "hand", label: "Hand", paired: true },
  { id: "leg", label: "Leg", paired: true },
  { id: "foot", label: "Foot", paired: true },
]
export const regionLabel = (id: RegionId) => REGIONS.find((r) => r.id === id)!.label

// ---------- names ----------

export const baseName = (raw: string) => raw.replace(/\.[lr]$/, "")
export const isJunk = (raw: string) => /^\?/.test(raw)

export function sideOf(raw: string, x: number): Side {
  if (raw.endsWith(".l")) return "l"
  if (raw.endsWith(".r")) return "r"
  return Math.abs(x) < 0.04 * BODY_HALF_W ? "mid" : x > 0 ? "l" : "r"
}

// ponytail: a height/width heuristic on the structure's centre, not true anatomy; the self-check pins known bones
export function regionOf(system: SystemId, name: string, c: { x: number; y: number }): RegionId {
  if (system !== "nervous") {
    if (/\blungs?\b|lobe of|\bheart\b|atri(um|al)|ventric|bronch|trache|pleura|thymus|oesophag|\brib\b|sternum|costal|diaphragm/i.test(name)) return "thorax"
    if (/liver|stomach|spleen|pancrea|duoden|jejun|ileum|colon|kidney|suprarenal|gallbladder/i.test(name)) return "abdomen"
  }
  const t = (c.y - BODY.minY) / BODY_H
  const u = Math.abs(c.x) / BODY_HALF_W
  if (u >= 0.55 && t < 0.5) return "hand"
  if (u >= 0.4 && t >= 0.48) return "arm"
  if (t < 0.06) return "foot"
  if (t < 0.47 && u > 0.06) return "leg"
  if (t >= 0.82) return "head"
  if (t >= 0.7) return "thorax"
  if (t >= 0.56) return "abdomen"
  return "pelvis"
}

// ---------- tissue ----------

// First match wins. M = Z-Anatomy material name, N = structure name.
export function classifyTissue(system: SystemId, M: string, N: string): Tissue {
  const m = (re: RegExp) => re.test(M)
  const n = (re: RegExp) => re.test(N)
  if (n(/pleura|peritoneum|omentum|mesocolon|meso-appendix|falx|tentorium/i)) return "membrane"
  if (m(/^Cartilage/i) || n(/cartilage|menisc|labrum|intervertebral disc|nucleus pulposus|an+ulus fibrosus|symphysis/i)) return "cartilage"
  if (m(/^(Teeth|Dentine)/i) || n(/incisor|canine|premolar|molar/i)) return "tooth"
  if (system === "skeletal") return "bone"
  if (m(/^Tendon/i) || n(/tendon(?! sheath)|aponeurosis|retinacul|iliotibial tract|fibrous sheath|linea alba|raphe/i)) return "tendon"
  if (m(/^Bursa/i) || n(/bursa|tendon sheath|synovial/i)) return "bursa"
  if (m(/^Fat/i) || n(/fat pad/i)) return "fat"
  if (m(/^(Ligament|Articular capsule)/i) || system === "joints") return "ligament"
  if (system === "fascia" || m(/^Fascia/i)) return "fascia"
  if (system === "muscular" || n(/tongue/i)) return "muscle"
  // atlas convention: pulmonary arteries carry blue blood, pulmonary veins red
  if (m(/^Pulmonary artery/i)) return "vein"
  if (m(/^Pulmonary vein/i)) return "artery"
  if (m(/^Artery/i)) return "artery"
  if (m(/^Vein/i)) return "vein"
  if (system === "cardiovascular") {
    if (n(/\bvein|vena|venous|sinus/i)) return "vein"
    if (n(/leaflet|valve/i)) return "valve"
    if (n(/atrium|ventricle$|papillary/i)) return "heart"
    return "artery"
  }
  if (system === "lymphatic") {
    if (n(/spleen/i)) return "spleen"
    if (n(/thymus/i)) return "thymus"
    if (n(/tonsil/i)) return "tonsil"
    return "lymphNode"
  }
  if (system === "nervous") {
    if (m(/^Nerve/i) || n(/nerve|plexus|ganglion|ramus|branch|root|ansa|cauda|chorda/i)) return "nerve"
    if (m(/^(Brain|Interlobar)/i) || n(/gyrus|sulcus|lobule|lobe|cuneus|insula|Lat_Fis|pole/i)) return "brain"
    if (n(/cornea|lens|chamber of eyeball|vitreous/i)) return "clear"
    if (m(/^Eye/i)) return "eye"
    return "neural"
  }
  if (system === "respiratory") {
    if (n(/lobe of .*lung/i)) return "lung"
    if (n(/bronch|trachea/i)) return "airway"
    if (m(/^Mucosa/i)) return "mucosa"
  }
  if (system === "digestive") {
    if (n(/liver/i)) return "liver"
    if (n(/stomach/i)) return "stomach"
    if (n(/duoden|jejun|ileum|colon|append|taenia/i)) return "intestine"
    if (n(/oesophag|pharynx/i)) return "oesophagus"
    if (n(/pancrea/i)) return "pancreas"
    if (n(/gallbladder|bile duct/i)) return "gallbladder"
    if (n(/gland/i)) return "gland"
    if (n(/gingiva|palate|uvula|epiglottis/i)) return "mucosa"
  }
  if (system === "urinary") return n(/kidney/i) ? "kidney" : n(/bladder/i) ? "bladder" : "duct"
  if (system === "reproductive") {
    if (n(/testis|epididymis/i)) return "testis"
    if (n(/prostate|seminal/i)) return "gland"
    if (n(/corpus|glans/i)) return "erectile"
    return "duct"
  }
  if (system === "endocrine") return n(/thyroid/i) ? "thyroid" : n(/suprarenal/i) ? "adrenal" : "gland"
  return "generic"
}

// ---------- search ----------

export interface SearchEntry { key: string; label: string; norm: string; system: SystemId; region: RegionId; side: Side }

export const normalize = (s: string) => s.toLowerCase().replace(/[()*'’]/g, " ").replace(/\s+/g, " ").trim()

// every query word must appear; whole-name prefix beats word start beats substring, then shorter names
export function searchIndex(entries: SearchEntry[], query: string, limit = 12): SearchEntry[] {
  const q = normalize(query)
  if (q.length < 2) return []
  const words = q.split(" ")
  const scored: [number, SearchEntry][] = []
  for (const e of entries) {
    if (!words.every((w) => e.norm.includes(w))) continue
    const rank = e.norm.startsWith(q) ? 0 : e.norm.includes(" " + q) ? 1 : 2
    scored.push([rank * 1000 + e.norm.length, e])
  }
  scored.sort((a, b) => a[0] - b[0])
  return scored.slice(0, limit).map((s) => s[1])
}
