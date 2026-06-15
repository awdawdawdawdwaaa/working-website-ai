/**
 * PropLoader.jsx
 *
 * Places 5 Meshy AI GLB props in the corridor.
 * Corridor: 6 m wide (±3.00 m), 5 m tall, starts Z=-4.
 * Props alternate left/right walls.
 *
 * ORDER:
 *  Z= 8  right → Age Wall (BEGIN)
 *  Z=16  left  → Brushed Steel City (BUILD)
 *  Z=24  right → Ahmedabad Map Install (ORIGIN)
 *  Z=32  left  → Time in Steel (TME)
 *  Z=38  right → Python Development (CREATE)
 *
 * WALL MOUNTING:
 *   Props are placed so their BACK face is flush with the wall surface.
 *   All props are centred vertically at EYE_Y (1.55 m).
 *
 * MATERIALS:
 *   All props get reduced metalness (≤0.3) and increased roughness (≥0.65)
 *   for a matte museum / brushed-aluminium look.
 */

import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { registerPropOutline } from '../core/narrativeRegistry'

// ─── SCENE CONSTANTS ──────────────────────────────────────────────────────────
const WALL_X  = { right:  3.00, left: -3.00 }
const WALL_IN = { right: -1,    left:  1    }
const EYE_Y   = 1.55
const GAP     = 0.02

// ─── PROP MANIFEST ───────────────────────────────────────────────────────────
// rotY: rotation so the FRONT of the prop faces the corridor (into the room).
// For right-wall props: rotY = -π/2 (face toward -X = into corridor).
// For left-wall props:  rotY = +π/2 (face toward +X = into corridor).
// targetH: desired rendered height in metres.
const PROPS = [
  // ── RIGHT (Z=8): Age Wall → BEGIN
  {
    id: 'AGE_WALL',
    file: '/props/Meshy_AI_Age_Wall_0611070403_texture.glb',
    z: 8.0, wall: 'right', mount: 'wall',
    targetH: 1.40, rotY: -Math.PI / 2,
  },
  // ── LEFT (Z=16): Brushed Steel City → BUILD
  {
    id: 'BRUSHED_STEEL_CITY',
    file: '/props/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb',
    z: 16.0, wall: 'left', mount: 'wall',
    targetH: 1.30, rotY: Math.PI / 2,
  },
  // ── RIGHT (Z=24): Ahmedabad Map Install → ORIGIN
  {
    id: 'AHMEDABAD_MAP_INSTALL',
    file: '/props/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb',
    z: 24.0, wall: 'right', mount: 'wall',
    targetH: 1.50, rotY: -Math.PI / 2,
  },
  // ── LEFT (Z=32): Time in Steel → TME
  {
    id: 'TIME_IN_STEEL',
    file: '/props/Meshy_AI_Time_in_Steel_0611065420_texture.glb',
    z: 32.0, wall: 'left', mount: 'wall',
    targetH: 1.30, rotY: Math.PI / 2,
  },
  // ── RIGHT (Z=38): Python Development → CREATE
  {
    id: 'PYTHON_DEV',
    file: '/props/Meshy_AI_Python_Development_Ex_0611071109_texture.glb',
    z: 38.0, wall: 'right', mount: 'wall',
    targetH: 1.30, rotY: -Math.PI / 2,
  },
]

// ─── MATERIAL OVERRIDE ────────────────────────────────────────────────────────
// Reduce metalness for matte museum look, clamp roughness so no mirror shine.
function applyMaterialOverride(obj) {
  obj.traverse(child => {
    if (!child.isMesh) return
    child.castShadow    = true
    child.receiveShadow = true

    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach(mat => {
      if (!mat) return
      // Clamp metalness — brushed metal max 0.30, no chrome
      mat.metalness = Math.min(0.30, (mat.metalness ?? 0.5) * 0.55)
      // Clamp roughness — minimum 0.62 for matte look
      mat.roughness = Math.max(0.62, (mat.roughness ?? 0.5))
      // Emissive reduction — avoid self-lit objects
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = Math.min(0.30, mat.emissiveIntensity)
      }
      mat.needsUpdate = true
    })
  })
}

// ─── BOUNDING BOX PLACEMENT ──────────────────────────────────────────────────
// Returns {posX, posY, posZ, sf} for a given config.
function computePlacement(config, rawScene) {
  const box    = new THREE.Box3().setFromObject(rawScene)
  const size   = new THREE.Vector3()
  const centre = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(centre)

  // Scale so height == targetH
  const sf = size.y > 0 ? config.targetH / size.y : 1

  const mount = config.mount

  if (mount === 'wall') {
    // After rotY (±π/2), the prop's local Z becomes world X.
    // The dimension facing the wall is the prop's local Z extent (size.z).
    // Half-depth in world space:
    const halfDepth = (size.z * sf) / 2
    const wallSurf  = WALL_X[config.wall]
    const dir       = WALL_IN[config.wall]

    const posX = wallSurf + dir * (halfDepth + GAP)

    // Vertical: centre prop bbox at EYE_Y
    const pivotOffY = centre.y * sf   // pivot-to-bbox-centre in scaled space
    const posY = EYE_Y - pivotOffY

    return { posX, posY, posZ: config.z, sf }

  } else if (mount === 'floor-lean') {
    // Floor-standing prop leaning against wall.
    // Ground: box.min.y * sf → Y=0
    const posY   = -box.min.y * sf
    // Pull from wall so front is ~0.15 m from wall surface
    const wallSurf = WALL_X[config.wall]
    const dir      = WALL_IN[config.wall]
    // Depth of prop after scale (local Z, world X after rotation)
    const depth  = size.z * sf
    const posX   = wallSurf + dir * (depth * 0.55 + 0.10)

    return { posX, posY, posZ: config.z, sf }

  } else if (mount === 'plinth') {
    // Small object on a pedestal. Prop sits on top of plinth.
    const plinthTop = config.plinthH ?? 0.90
    const posY      = plinthTop - box.min.y * sf
    const wallSurf  = WALL_X[config.wall]
    const dir       = WALL_IN[config.wall]
    const posX      = wallSurf + dir * 0.80

    return { posX, posY, posZ: config.z, sf }
  }

  return { posX: 0, posY: 0, posZ: config.z, sf }
}

// ─── VED PROLOGUE PLAQUE ─────────────────────────────────────────────────────
// First visible object in the corridor. Mounted on the FRONT wall (back wall
// at Z = CZ0 = -4, but we place it slightly into corridor at Z = 1.5 on left wall)
// so it is visible as character/camera begins. Faces into the corridor (+X direction).
// Wall-mounted, centred at eye level (Y = 1.55). No floating — flush to left wall.
//
// This is a procedural mesh plaque (no GLB) — a dark panel with metallic trim.
function VedProloguePlaque() {
  // Left wall surface at X = -3.00. Push plaque off wall by half-depth.
  const PLAQUE_DEPTH = 0.06
  const posX = -3.00 + PLAQUE_DEPTH / 2 + GAP  // flush to left wall, inset slightly
  const posY = EYE_Y                             // centred at eye level
  const posZ = 1.5                               // just past character start (Z=-1.2)

  return (
    <group position={[posX, posY, posZ]} rotation={[0, Math.PI / 2, 0]}>
      {/* Backing panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.10, 0.80, PLAQUE_DEPTH]} />
        <meshStandardMaterial color="#1e1c18" roughness={0.55} metalness={0.28} />
      </mesh>
      {/* Metallic border frame */}
      <mesh position={[0, 0, PLAQUE_DEPTH / 2 + 0.004]}>
        <boxGeometry args={[1.14, 0.84, 0.008]} />
        <meshStandardMaterial color="#5a4e3a" roughness={0.35} metalness={0.62} />
      </mesh>
      {/* Inner dark recess */}
      <mesh position={[0, 0.06, PLAQUE_DEPTH / 2 + 0.008]}>
        <boxGeometry args={[0.96, 0.38, 0.006]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.80} metalness={0.10} />
      </mesh>
      {/* Name plate strip — emissive warm gold */}
      <mesh position={[0, 0.06, PLAQUE_DEPTH / 2 + 0.012]}>
        <planeGeometry args={[0.88, 0.12]} />
        <meshStandardMaterial
          color="#c8a050"
          emissive="#c8a050"
          emissiveIntensity={0.18}
          roughness={0.30}
          metalness={0.55}
        />
      </mesh>
      {/* Lower text strip */}
      <mesh position={[0, -0.20, PLAQUE_DEPTH / 2 + 0.008]}>
        <planeGeometry args={[0.88, 0.22]} />
        <meshStandardMaterial color="#2a2620" roughness={0.70} metalness={0.15} />
      </mesh>
    </group>
  )
}

// ─── PLINTH ──────────────────────────────────────────────────────────────────
function Plinth({ x, z, h }) {
  return (
    <mesh position={[x, h/2, z]} castShadow receiveShadow>
      <boxGeometry args={[0.55, h, 0.55]} />
      <meshStandardMaterial color="#2e2c28" roughness={0.70} metalness={0.24} />
    </mesh>
  )
}

// ─── SINGLE PROP ──────────────────────────────────────────────────────────────
function Prop({ config }) {
  const groupRef = useRef(null)
  const { scene } = useGLTF(config.file)

  const cloned = useMemo(() => scene.clone(true), [scene])

  const placement = useMemo(() => computePlacement(config, cloned), [cloned, config])

  useEffect(() => { applyMaterialOverride(cloned) }, [cloned])

  useEffect(() => {
    if (!groupRef.current) return

    const box = new THREE.Box3().setFromObject(groupRef.current)
    const centerY = (box.min.y + box.max.y) / 2
    const centerZ = (box.min.z + box.max.z) / 2
    const faceX = config.wall === 'right' ? box.min.x - 0.025 : box.max.x + 0.025

    registerPropOutline(config.id, [
      new THREE.Vector3(faceX, box.min.y, box.min.z),
      new THREE.Vector3(faceX, centerY, box.min.z),
      new THREE.Vector3(faceX, box.max.y, box.min.z),
      new THREE.Vector3(faceX, box.max.y, centerZ),
      new THREE.Vector3(faceX, box.max.y, box.max.z),
      new THREE.Vector3(faceX, centerY, box.max.z),
      new THREE.Vector3(faceX, box.min.y, box.max.z),
      new THREE.Vector3(faceX, box.min.y, centerZ),
      new THREE.Vector3(faceX, box.min.y, box.min.z),
    ])
  }, [config.id, config.wall, placement])

  const { posX, posY, posZ, sf } = placement

  return (
    <group ref={groupRef} position={[posX, posY, posZ]} rotation={[0, config.rotY, 0]} scale={sf}>
      <primitive object={cloned} />
    </group>
  )
}

// ─── PLINTHS ──────────────────────────────────────────────────────────────────
function Plinths() {
  return (
    <>
      {PROPS.filter(p => p.mount === 'plinth').map(p => (
        <Plinth
          key={p.id + '_plinth'}
          x={WALL_X[p.wall] + WALL_IN[p.wall] * 0.80}
          z={p.z}
          h={p.plinthH ?? 0.90}
        />
      ))}
    </>
  )
}

// Preload all
PROPS.forEach(p => useGLTF.preload(p.file))

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function PropLoader() {
  return (
    <>
      <Plinths />
      {PROPS.map(cfg => <Prop key={cfg.id} config={cfg} />)}
    </>
  )
}
