"""Export Z-Anatomy (Startup.blend) to one GLB per body system for the 3D Body Explorer.

Usage:
  blender -b Z-Anatomy/Startup.blend --python scripts/export-anatomy.py -- <out_dir> <right_kidney.stl> <left_kidney.stl>

Sources and licenses:
  Z-Anatomy (CC-BY-SA 4.0): https://github.com/Z-Anatomy/Models-of-human-anatomy
  BodyParts3D (c) DBCLS (CC-BY-SA 2.1 JP): kidneys FMA7204 (right) and FMA7205 (left)
Z-Anatomy's inner ear (CC-BY-NC-SA) and kidney (CC-BY-NC) are non-commercial, so they are removed
and the kidneys are replaced with BodyParts3D meshes (see public/models/LICENSE.txt).

Then simplify + compress each GLB into public/models (ratio per system: skin 0.9, muscular 0.25,
skeletal/joints 0.35, nervous/urinary 0.3, respiratory/digestive 0.4, cardiovascular/lymphatic 0.5,
reproductive/endocrine 0.6):
  npx @gltf-transform/cli@4 optimize <out_dir>/<id>.glb public/models/<id>.glb --compress meshopt \
    --join false --instance false --palette false --flatten true --simplify-ratio <ratio> --simplify-error 0.002
"""
import json
import os
import sys

import bpy
from mathutils import Matrix, Vector

out_dir, kidney_r, kidney_l = sys.argv[sys.argv.index("--") + 1:]
os.makedirs(out_dir, exist_ok=True)

# system id -> top-level collections, or ("8: Visceral systems", sub-collection)
VISCERAL = "8: Visceral systems"
SYSTEMS = {
    "skin": ["9: Regions of human body"],
    "muscular": ["4: Muscular system"],
    "skeletal": ["1: Skeletal system"],
    "joints": ["3: Joints"],
    "cardiovascular": ["5: Cardiovascular system"],
    "lymphatic": ["6: Lymphoid organs", (VISCERAL, "Lymphoid system")],
    "nervous": ["7: Nervous system & Sense organs"],
    "respiratory": [(VISCERAL, "Respiratory system")],
    "digestive": [(VISCERAL, "Digestive system")],
    "urinary": [(VISCERAL, "Urinary system")],
    "reproductive": [(VISCERAL, "Genital systems'")],
    "endocrine": [(VISCERAL, "Endocrine glands")],
}
# visceral objects not in any sub-collection
UNASSIGNED = {
    "Mesocolon": "digestive", "Meso-appendix": "digestive", "Greater omentum": "digestive",
    "Lesser omentum": "digestive", "Oropharynx": "digestive", "Laryngopharynx": "digestive",
    "Soft palate": "digestive", "Nasopharynx": "respiratory", "Mucosa of nasal cavity": "respiratory",
}
NON_COMMERCIAL = {"Cochlea.l", "Cochlea.r", "Vestibule.l", "Vestibule.r", "Kidney.l", "Kidney.r"}


def keep(o):
    return o.type in ("MESH", "CURVE") and not o.name.endswith((".j", ".g", ".i", ".t", ".s"))


# 1. assign objects to systems (first match wins)
col = bpy.data.collections
owner = {}
for sid, sources in SYSTEMS.items():
    for src in sources:
        if isinstance(src, tuple):
            parent, sub = src
            objs = [o for o in col[sub].all_objects if o.name in col[parent].all_objects]
        else:
            objs = col[src].all_objects
        for o in objs:
            if keep(o) and o.name not in owner:
                owner[o.name] = sid
for o in col[VISCERAL].all_objects:
    if keep(o) and o.name not in owner:
        base = o.name.rsplit(".", 1)[0] if o.name.endswith((".l", ".r")) else o.name
        owner[o.name] = UNASSIGNED.get(o.name) or ("endocrine" if "parathyroid" in base.lower() else None)
# deep fasciae wrap the muscles like a sleeve: give them their own system so muscles are visible
SYSTEMS["fascia"] = []
for n, s in owner.items():
    mat = bpy.data.objects[n].active_material
    if s == "muscular" and mat and mat.name.startswith("Fascia"):
        owner[n] = "fascia"
missing = [n for n, s in owner.items() if s is None]
print("UNASSIGNED visceral:", missing)
owner = {n: s for n, s in owner.items() if s}

kidney_mat = bpy.data.objects["Kidney.l"].active_material
for n in NON_COMMERCIAL:
    owner.pop(n, None)

# 2. build flat export objects: evaluated mesh copies (curves -> tubes, modifiers applied), world transforms baked
# vessels/nerves are curves; low tube resolution keeps them light on the web
for name in owner:
    o = bpy.data.objects[name]
    if o.type == "CURVE":
        o.data.resolution_u = min(o.data.resolution_u, 4)
        o.data.bevel_resolution = min(o.data.bevel_resolution, 1)
depsgraph = bpy.context.evaluated_depsgraph_get()
export = {sid: [] for sid in SYSTEMS}
for name, sid in owner.items():
    src = bpy.data.objects[name]
    ev = src.evaluated_get(depsgraph)
    try:
        me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=False, depsgraph=depsgraph)
    except RuntimeError:
        continue
    if len(me.polygons) == 0:
        bpy.data.meshes.remove(me)
        continue
    me.transform(src.matrix_world)
    ob = bpy.data.objects.new(name, me)
    ob["name"] = name
    export[sid].append(ob)

# 3. BodyParts3D kidneys (mm) fitted onto the removed Z-Anatomy kidneys
for path, zname in ((kidney_r, "Kidney.r"), (kidney_l, "Kidney.l")):
    target = bpy.data.objects[zname]
    tb = [target.matrix_world @ Vector(c) for c in target.bound_box]
    bpy.ops.wm.stl_import(filepath=path)
    k = bpy.context.selected_objects[0]
    k.data.transform(k.matrix_world)
    k.matrix_world.identity()
    kb = [Vector(c) for c in k.bound_box]
    size = lambda b: max(max(v[i] for v in b) - min(v[i] for v in b) for i in range(3))
    center = lambda b: sum(b, Vector()) / 8
    s = size(tb) / size(kb)
    k.data.transform(Matrix.Translation(-center(kb)))
    k.data.transform(Matrix.Scale(s, 4))
    k.data.transform(Matrix.Translation(center(tb)))
    for c in list(k.users_collection):
        c.objects.unlink(k)
    k.name = zname
    k["name"] = zname
    k.data.materials.clear()
    k.data.materials.append(kidney_mat)
    export["urinary"].append(k)
    print("KIDNEY", zname, "scale", round(s, 5))

# 4. recenter the whole body on the origin so the viewer can explode radially from (0,0,0)
lo, hi = Vector((1e9,) * 3), Vector((-1e9,) * 3)
for obs in export.values():
    for ob in obs:
        for v in ob.data.vertices:
            lo = Vector(map(min, lo, v.co))
            hi = Vector(map(max, hi, v.co))
shift = -(lo + hi) / 2
print("BODY bbox", tuple(round(x, 3) for x in lo), tuple(round(x, 3) for x in hi))

# 5. export one GLB per system
for sid, obs in export.items():
    c = bpy.data.collections.new("EXPORT_" + sid)
    bpy.context.scene.collection.children.link(c)
    for ob in obs:
        if ob.get("_shifted") is None:
            ob.data.transform(Matrix.Translation(shift))
            ob["_shifted"] = True
        c.objects.link(ob)
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[c.name]
    path = os.path.join(out_dir, sid + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_active_collection=True, use_visible=False,
        export_extras=True, export_apply=True, export_yup=True, export_texcoords=False,
        export_normals=True, export_animations=False, export_cameras=False, export_lights=False,
    )
    tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in obs)
    print("EXPORTED", sid, len(obs), "objects", tris, "tris", os.path.getsize(path) // 1024, "KB")
    bpy.context.scene.collection.children.unlink(c)

# 6. structure names per system, for the viewer's search (copy to public/models/index.json)
with open(os.path.join(out_dir, "index.json"), "w") as f:
    json.dump({sid: sorted(ob["name"] for ob in obs) for sid, obs in export.items()}, f, separators=(",", ":"))
