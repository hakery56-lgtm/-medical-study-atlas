import * as THREE from "three"
import type { Tissue } from "./catalog.ts"

// The models have no UVs or textures, so everything organic comes from a small shader patch:
// world-space noise for colour mottling, fibre streaks along each structure's long axis, and a micro bump.
// Every material shares a handful of compiled programs (customProgramCacheKey); only the uniforms differ.

interface Look { color: string; rough: number; cc?: number; ccRough?: number; fibre?: number; bump?: number; mottle?: number; opacity?: number; keepGlb?: boolean }

const L = (color: string, rough: number, o: Partial<Look> = {}): Look => ({ color, rough, ...o })

export const TISSUES: Record<Tissue, Look> = {
  muscle: L("#a8322d", 0.55, { cc: 0.6, ccRough: 0.35, fibre: 1, bump: 0.6, mottle: 0.12 }),
  tendon: L("#e9e2d0", 0.35, { cc: 0.8, ccRough: 0.2, fibre: 0.6, bump: 0.3, mottle: 0.05 }),
  ligament: L("#dcd6c4", 0.4, { cc: 0.6, ccRough: 0.3, fibre: 0.5, bump: 0.3, mottle: 0.05 }),
  cartilage: L("#cfdde0", 0.25, { cc: 0.9, ccRough: 0.15, bump: 0.1, mottle: 0.04 }),
  bone: L("#e3d6bc", 0.7, { cc: 0, bump: 0.25, mottle: 0.18 }),
  tooth: L("#f2ede0", 0.2, { cc: 0.5, bump: 0, mottle: 0.03 }),
  bursa: L("#cfd8c8", 0.3, { cc: 0.6, opacity: 0.6, bump: 0, mottle: 0.04 }),
  fat: L("#e8c86a", 0.5, { cc: 0.4, bump: 0.2, mottle: 0.1 }),
  fascia: L("#b9c9cf", 0.45, { opacity: 0.55, bump: 0, mottle: 0.05 }),
  membrane: L("#f0d9a8", 0.4, { opacity: 0.35, bump: 0, mottle: 0.04 }),
  artery: L("#b8262b", 0.4, { cc: 0.8, ccRough: 0.2, fibre: 0.2, bump: 0.15, mottle: 0.06 }),
  vein: L("#2f4f9a", 0.4, { cc: 0.8, ccRough: 0.2, fibre: 0.2, bump: 0.15, mottle: 0.06 }),
  heart: L("#9e2f2a", 0.45, { cc: 0.7, fibre: 0.4, bump: 0.4, mottle: 0.1 }),
  valve: L("#e3cfc0", 0.4, { cc: 0.5 }),
  nerve: L("#f0d36a", 0.45, { cc: 0.5, fibre: 0.4, bump: 0.3, mottle: 0.06 }),
  brain: L("#e9b8a8", 0.5, { cc: 0.6, bump: 0.4, mottle: 0.15 }),
  neural: L("#d8c8a0", 0.5, { cc: 0.4, keepGlb: true }),
  clear: L("#dfeaf0", 0.1, { cc: 1, opacity: 0.25 }),
  eye: L("#f2efe8", 0.2, { cc: 0.8, keepGlb: true }),
  lymphNode: L("#8fbf6f", 0.5, { cc: 0.6 }),
  spleen: L("#6e2638", 0.5, { cc: 0.6, mottle: 0.1 }),
  thymus: L("#e0b8a0", 0.5, { cc: 0.5 }),
  tonsil: L("#d9908a", 0.5, { cc: 0.5 }),
  lung: L("#e3a3a0", 0.6, { cc: 0.3, bump: 0.6, mottle: 0.25 }),
  airway: L("#e6d3c3", 0.4, { cc: 0.7, ccRough: 0.25 }),
  mucosa: L("#c45a62", 0.35, { cc: 0.8, ccRough: 0.2, mottle: 0.1 }),
  liver: L("#7a2a22", 0.45, { cc: 0.7, ccRough: 0.25, bump: 0.3, mottle: 0.12 }),
  stomach: L("#d9907d", 0.45, { cc: 0.7, bump: 0.3, mottle: 0.12 }),
  intestine: L("#d9907d", 0.45, { cc: 0.7, bump: 0.3, mottle: 0.12 }),
  oesophagus: L("#c97b6d", 0.45, { cc: 0.7, mottle: 0.1 }),
  pancreas: L("#e3c08f", 0.55, { cc: 0.4, bump: 0.4, mottle: 0.3 }),
  gallbladder: L("#4f7a3a", 0.3, { cc: 0.9, ccRough: 0.15 }),
  gland: L("#d9b08a", 0.5, { cc: 0.5, mottle: 0.15 }),
  kidney: L("#8a3a2c", 0.45, { cc: 0.7, mottle: 0.12 }),
  bladder: L("#d8a69a", 0.45, { cc: 0.7 }),
  duct: L("#b89a7a", 0.45, { cc: 0.5 }),
  testis: L("#e8d2c8", 0.4, { cc: 0.7 }),
  erectile: L("#c98f86", 0.5, { cc: 0.5 }),
  thyroid: L("#a8463b", 0.45, { cc: 0.6 }),
  adrenal: L("#d9a441", 0.5, { cc: 0.5 }),
  generic: L("#cfc6b8", 0.55, { cc: 0.4, keepGlb: true }),
}

export const isTranslucent = (t: Tissue) => (TISSUES[t].opacity ?? 1) < 1

export function hashName(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

export interface AnatUniforms {
  uAxis: { value: THREE.Vector3 }
  uFibre: { value: number }
  uBump: { value: number }
  uMottle: { value: number }
  uRoughVar: { value: number }
  uSeed: { value: number }
}

const PROGRAM_KEY = "anat1"

// ---------- shader patch (three r169 meshphysical chunks) ----------

const VARYING = "varying vec3 vBodyPos;"
const FRAG_COMMON = /* glsl */ `
varying vec3 vBodyPos;
uniform vec3 uAxis; uniform float uFibre; uniform float uBump; uniform float uMottle; uniform float uRoughVar; uniform float uSeed;
float anatHash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float anatNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(anatHash(i), anatHash(i + vec3(1,0,0)), f.x), mix(anatHash(i + vec3(0,1,0)), anatHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(anatHash(i + vec3(0,0,1)), anatHash(i + vec3(1,0,1)), f.x), mix(anatHash(i + vec3(0,1,1)), anatHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
vec3 anatPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDirection) {
  vec3 sx = normalize(dFdx(surfPos)); vec3 sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, surfNorm); vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDirection;
  vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
  return normalize(abs(det) * surfNorm - grad);
}`

const COLOR_PATCH = /* glsl */ `
#include <color_fragment>
float anatH = 0.5;
{
  vec3 bp = vBodyPos + uSeed;
  float fpMot = length(fwidth(vBodyPos)) * 40.0;
  float lodMot = 1.0 - smoothstep(0.5, 1.3, fpMot);
  float mot = anatNoise(bp * 40.0) * 0.65 + anatNoise(bp * 95.0) * 0.35;
  float fib = 0.5;
  float lodFib = 0.0;
  if (uFibre > 0.001) {
    float along = dot(bp, uAxis); vec3 across = bp - along * uAxis;
    fib = anatNoise(across * 260.0 + uAxis * along * 22.0);
    lodFib = 1.0 - smoothstep(0.25, 0.75, length(fwidth(vBodyPos)) * 260.0);
  }
  anatH = mix(mot, fib, uFibre * lodFib);
  diffuseColor.rgb *= 1.0 + uMottle * lodMot * (mot - 0.5) * 2.0 - uFibre * lodFib * 0.14 * (fib - 0.5) * 2.0;
}`

const ROUGH_PATCH = /* glsl */ `
#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + uRoughVar * (anatH - 0.5), 0.05, 1.0);`

const NORMAL_PATCH = /* glsl */ `
#include <normal_fragment_maps>
normal = anatPerturb(-vViewPosition, normal, vec2(dFdx(anatH), dFdy(anatH)) * uBump * 2.6, faceDirection);`

function patch(src: string, token: string, replacement: string) {
  if (!src.includes(token) && process.env.NODE_ENV !== "production") console.warn("anatomy shader: missing", token)
  return src.replace(token, replacement)
}

function anatCompile(this: THREE.Material, shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, { value: unknown }> }) {
  const u = this.userData.anat as AnatUniforms
  Object.assign(shader.uniforms, u)
  shader.vertexShader = patch(shader.vertexShader, "#include <common>", `#include <common>\n${VARYING}`)
  shader.vertexShader = patch(shader.vertexShader, "#include <project_vertex>", "#include <project_vertex>\nvBodyPos = mat3(modelMatrix) * transformed;")
  let f = shader.fragmentShader
  f = patch(f, "#include <common>", `#include <common>\n${FRAG_COMMON}`)
  f = patch(f, "#include <color_fragment>", COLOR_PATCH)
  f = patch(f, "#include <roughnessmap_fragment>", ROUGH_PATCH)
  f = patch(f, "#include <normal_fragment_maps>", NORMAL_PATCH)
  shader.fragmentShader = f
}

export type Tier = "high" | "low"
const tmpHsl = { h: 0, s: 0, l: 0 }

export function makeMaterial(tissue: Tissue, glbColor: THREE.Color | null, name: string, axis: THREE.Vector3, tier: Tier, systemColor: string) {
  const look = TISSUES[tissue]
  const h = hashName(name)
  const color = new THREE.Color(look.keepGlb && glbColor && !(glbColor.r > 0.98 && glbColor.g > 0.98 && glbColor.b > 0.98) ? glbColor : look.keepGlb ? systemColor : look.color)
  // slight per-structure variation so neighbouring muscles read as separate, like a printed atlas
  color.getHSL(tmpHsl)
  const k = tissue === "muscle" || tissue === "bone" || tissue === "tendon" || tissue === "ligament" ? 1 : 0.5
  color.setHSL(tmpHsl.h + (h - 0.5) * 0.016 * k, Math.min(1, Math.max(0, tmpHsl.s + (((h * 7.13) % 1) - 0.5) * 0.1 * k)), Math.min(1, Math.max(0, tmpHsl.l + (((h * 3.71) % 1) - 0.5) * 0.12 * k)))
  const cc = tier === "low" ? 0 : look.cc ?? 0
  const m = new THREE.MeshPhysicalMaterial({
    color,
    roughness: Math.max(0.05, look.rough - (tier === "low" && look.cc ? 0.1 : 0)),
    metalness: 0,
    clearcoat: cc,
    clearcoatRoughness: look.ccRough ?? 0.3,
    envMapIntensity: 0.4,
  })
  if (look.opacity !== undefined) { m.transparent = true; m.opacity = look.opacity; m.depthWrite = false }
  m.userData.anat = {
    uAxis: { value: axis.clone() },
    uFibre: { value: tier === "low" ? 0 : look.fibre ?? 0 },
    uBump: { value: tier === "low" ? 0 : look.bump ?? 0.3 },
    uMottle: { value: look.mottle ?? 0.1 },
    uRoughVar: { value: 0.18 },
    uSeed: { value: h * 100 },
  } satisfies AnatUniforms
  m.userData.baseOpacity = look.opacity ?? 1
  m.onBeforeCompile = anatCompile as unknown as THREE.Material["onBeforeCompile"]
  m.customProgramCacheKey = () => PROGRAM_KEY + (cc > 0 ? "c" : "")
  return m
}

// Long axis of a mesh by PCA on a sample of its vertices; used as the muscle fibre direction.
export function principalAxis(geometry: THREE.BufferGeometry) {
  const pos = geometry.getAttribute("position")
  const axis = new THREE.Vector3(0, 1, 0)
  if (!pos || pos.count < 8) return axis
  const step = Math.max(1, Math.ceil(pos.count / 400))
  let n = 0, mx = 0, my = 0, mz = 0
  for (let i = 0; i < pos.count; i += step) { mx += pos.getX(i); my += pos.getY(i); mz += pos.getZ(i); n++ }
  mx /= n; my /= n; mz /= n
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (let i = 0; i < pos.count; i += step) {
    const x = pos.getX(i) - mx, y = pos.getY(i) - my, z = pos.getZ(i) - mz
    xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z
  }
  for (let it = 0; it < 10; it++) {
    const x = xx * axis.x + xy * axis.y + xz * axis.z
    const y = xy * axis.x + yy * axis.y + yz * axis.z
    const z = xz * axis.x + yz * axis.y + zz * axis.z
    axis.set(x, y, z)
    if (axis.lengthSq() < 1e-20) return axis.set(0, 1, 0)
    axis.normalize()
  }
  return axis
}

// Translucent rim-lit silhouette that stands in for skin when the muscles are switched off.
export const ghostMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { uColor: { value: new THREE.Color("#7d8fa0") } },
  vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: /* glsl */ `uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
    void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5); gl_FragColor = vec4(uColor, f * 0.38 + 0.015); }`,
})
