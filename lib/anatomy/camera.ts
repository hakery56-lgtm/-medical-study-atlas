// Camera framing maths with plain arrays (no three.js), so it can be checked in Node.
import { BODY, BODY_H, BODY_HALF_W, type RegionId } from "./catalog.ts"

type V3 = [number, number, number]
export interface Box { min: V3; max: V3 }
export interface Insets { top: number; bottom: number; left: number; right: number }
export interface Fit { target: V3; position: V3; distance: number }

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
const sc = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

export const VIEWS: Record<string, V3> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  left: [1, 0, 0], // the model's left side (+x)
  right: [-1, 0, 0],
  top: [0, 1, 0.001],
}

export const HOME_BOX: Box = { min: [BODY.minX, BODY.minY, BODY.minZ], max: [BODY.maxX, BODY.maxY, BODY.maxZ] }

// Where to put the camera so `box` fills the usable part of the canvas (insets are fractions of the canvas),
// looking from direction `viewDir` (pointing from the target towards the camera).
export function fitBox(box: Box, viewDir: V3, fovDeg: number, aspect: number, insets: Insets): Fit {
  const v = norm(viewDir)
  const worldUp: V3 = Math.abs(v[1]) > 0.99 ? [0, 0, -1] : [0, 1, 0]
  const fwd = sc(v, -1)
  const right = norm(cross(fwd, worldUp))
  const up = cross(right, fwd)
  const c: V3 = [(box.min[0] + box.max[0]) / 2, (box.min[1] + box.max[1]) / 2, (box.min[2] + box.max[2]) / 2]
  let w0 = Infinity, w1 = -Infinity, h0 = Infinity, h1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (let i = 0; i < 8; i++) {
    const p = sub([i & 1 ? box.max[0] : box.min[0], i & 2 ? box.max[1] : box.min[1], i & 4 ? box.max[2] : box.min[2]], c)
    const w = dot(p, right), h = dot(p, up), z = dot(p, v)
    w0 = Math.min(w0, w); w1 = Math.max(w1, w); h0 = Math.min(h0, h); h1 = Math.max(h1, h); z0 = Math.min(z0, z); z1 = Math.max(z1, z)
  }
  const w = Math.max(w1 - w0, 0.08), h = Math.max(h1 - h0, 0.08), dz = z1 - z0
  const vt = Math.tan((fovDeg * Math.PI) / 360)
  const uH = Math.max(0.2, 1 - insets.top - insets.bottom)
  const uW = Math.max(0.2, 1 - insets.left - insets.right)
  const d = Math.max(h / 2 / (vt * uH), w / 2 / (vt * aspect * uW)) * 1.08 + dz / 2
  // slide the target so the box sits in the middle of the usable rectangle
  const ndcY = insets.bottom - insets.top
  const ndcX = insets.left - insets.right
  const target = sub(sub(c, sc(up, ndcY * d * vt)), sc(right, ndcX * d * vt * aspect))
  return { target, position: add(target, sc(v, d)), distance: d }
}

// Region framing: fractions of the body box. Paired regions take a side (+1 left / -1 right).
const REGION_BOX: Record<RegionId, { t: [number, number]; u: [number, number]; view: (s: number) => V3 }> = {
  head: { t: [0.8, 1], u: [-0.35, 0.35], view: () => VIEWS.front },
  thorax: { t: [0.62, 0.86], u: [-0.55, 0.55], view: () => VIEWS.front },
  abdomen: { t: [0.5, 0.72], u: [-0.5, 0.5], view: () => VIEWS.front },
  pelvis: { t: [0.4, 0.6], u: [-0.55, 0.55], view: () => VIEWS.front },
  arm: { t: [0.46, 0.86], u: [0.3, 1], view: (s) => [s * Math.sin(0.44), 0.1, Math.cos(0.44)] },
  hand: { t: [0.36, 0.52], u: [0.6, 1], view: (s) => [s * 0.3, 0, 1] },
  leg: { t: [0.02, 0.56], u: [0, 0.55], view: (s) => [s * Math.sin(0.44), 0.1, Math.cos(0.44)] },
  foot: { t: [0, 0.08], u: [0.05, 0.5], view: (s) => [s * 0.5, 0.6, 0.8] },
}

export function regionFit(region: RegionId, side: 1 | -1, fovDeg: number, aspect: number, insets: Insets): Fit {
  const r = REGION_BOX[region]
  const paired = region === "arm" || region === "hand" || region === "leg" || region === "foot"
  const x0 = paired ? side * r.u[0] * BODY_HALF_W : r.u[0] * BODY_HALF_W
  const x1 = paired ? side * r.u[1] * BODY_HALF_W : r.u[1] * BODY_HALF_W
  const box: Box = {
    min: [Math.min(x0, x1), BODY.minY + r.t[0] * BODY_H, BODY.minZ],
    max: [Math.max(x0, x1), BODY.minY + r.t[1] * BODY_H, BODY.maxZ],
  }
  return fitBox(box, r.view(side), fovDeg, aspect, insets)
}
