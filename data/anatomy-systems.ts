export interface AnatomySystem {
  id: string
  label: string
  file: string
  // used for materials exported without a color
  color: string
  // layer order for peeling, outermost first
  depth: number
  defaultOn?: boolean
}

export const anatomySystems: AnatomySystem[] = [
  { id: "fascia", label: "Deep fascia", file: "/models/fascia.glb", color: "#7ab8cc", depth: 0 },
  { id: "muscular", label: "Muscular", file: "/models/muscular.glb", color: "#b5443a", depth: 0, defaultOn: true },
  { id: "cardiovascular", label: "Cardiovascular", file: "/models/cardiovascular.glb", color: "#c0392b", depth: 1 },
  { id: "lymphatic", label: "Lymphatic", file: "/models/lymphatic.glb", color: "#7fb069", depth: 1 },
  { id: "nervous", label: "Nervous & Sense organs", file: "/models/nervous.glb", color: "#e8c547", depth: 1 },
  { id: "respiratory", label: "Respiratory", file: "/models/respiratory.glb", color: "#e08f8f", depth: 2 },
  { id: "digestive", label: "Digestive", file: "/models/digestive.glb", color: "#c8745a", depth: 2 },
  { id: "urinary", label: "Urinary", file: "/models/urinary.glb", color: "#a4553f", depth: 2 },
  { id: "reproductive", label: "Reproductive", file: "/models/reproductive.glb", color: "#d68fa8", depth: 2 },
  { id: "endocrine", label: "Endocrine", file: "/models/endocrine.glb", color: "#b77dc7", depth: 2 },
  { id: "joints", label: "Joints & Ligaments", file: "/models/joints.glb", color: "#9cc8c0", depth: 3 },
  { id: "skeletal", label: "Skeletal", file: "/models/skeletal.glb", color: "#ebe1cc", depth: 3, defaultOn: true },
]

export const MAX_DEPTH = 3

// "(Deep branch of x).l" -> "Deep branch of x (left)"
export function prettyName(raw: string) {
  const side = raw.endsWith(".l") ? " (left)" : raw.endsWith(".r") ? " (right)" : ""
  return raw.replace(/\.[lr]$/, "").replace(/^\((.*)\)$/, "$1").trim() + side
}
