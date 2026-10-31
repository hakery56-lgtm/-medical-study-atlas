export type SystemId =
  | "fascia" | "muscular" | "cardiovascular" | "lymphatic" | "nervous" | "respiratory"
  | "digestive" | "urinary" | "reproductive" | "endocrine" | "joints" | "skeletal"

// the groups people actually think in; a system with layer null is only reachable under "Fine tune"
export type LayerId = "muscles" | "skeleton" | "joints" | "organs" | "vessels"

export interface AnatomySystem {
  id: SystemId
  label: string
  file: string
  // used for materials exported without a color
  color: string
  // layer order for peeling, outermost first
  depth: number
  layer: LayerId | null
  // file size in bytes, for the loading progress
  bytes: number
}

export const anatomySystems: AnatomySystem[] = [
  { id: "fascia", label: "Deep fascia", file: "/models/fascia.glb", color: "#7ab8cc", depth: 0, layer: null, bytes: 397560 },
  { id: "muscular", label: "Muscular", file: "/models/muscular.glb", color: "#b5443a", depth: 0, layer: "muscles", bytes: 6212256 },
  { id: "cardiovascular", label: "Cardiovascular", file: "/models/cardiovascular.glb", color: "#c0392b", depth: 1, layer: "vessels", bytes: 2859268 },
  { id: "lymphatic", label: "Lymphatic", file: "/models/lymphatic.glb", color: "#7fb069", depth: 1, layer: "vessels", bytes: 633660 },
  { id: "nervous", label: "Nervous & Sense organs", file: "/models/nervous.glb", color: "#e8c547", depth: 1, layer: "vessels", bytes: 3721728 },
  { id: "respiratory", label: "Respiratory", file: "/models/respiratory.glb", color: "#e08f8f", depth: 2, layer: "organs", bytes: 445016 },
  { id: "digestive", label: "Digestive", file: "/models/digestive.glb", color: "#c8745a", depth: 2, layer: "organs", bytes: 676652 },
  { id: "urinary", label: "Urinary", file: "/models/urinary.glb", color: "#a4553f", depth: 2, layer: "organs", bytes: 544132 },
  { id: "reproductive", label: "Reproductive", file: "/models/reproductive.glb", color: "#d68fa8", depth: 2, layer: "organs", bytes: 69252 },
  { id: "endocrine", label: "Endocrine", file: "/models/endocrine.glb", color: "#b77dc7", depth: 2, layer: "organs", bytes: 61884 },
  { id: "joints", label: "Joints & Ligaments", file: "/models/joints.glb", color: "#9cc8c0", depth: 3, layer: "joints", bytes: 1712648 },
  { id: "skeletal", label: "Skeletal", file: "/models/skeletal.glb", color: "#ebe1cc", depth: 3, layer: "skeleton", bytes: 2492952 },
]

export const systemById = Object.fromEntries(anatomySystems.map((s) => [s.id, s])) as Record<SystemId, AnatomySystem>

// "(Deep branch of x).l" -> "Deep branch of x (left)"
export function prettyName(raw: string) {
  const side = raw.endsWith(".l") ? " (left)" : raw.endsWith(".r") ? " (right)" : ""
  return raw.replace(/\.[lr]$/, "").replace(/^\((.*)\)$/, "$1").trim() + side
}
