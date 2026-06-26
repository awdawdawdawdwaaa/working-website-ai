import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import DevOrbitControls from './DevOrbitControls'

// Logitech M-M28: 99x56x31mm boxy white, 2 buttons, front cable, ball mouse
const MOUSE_LEN = 0.099
const MOUSE_HW = 0.028
const MOUSE_HR = 0.031
const MOUSE_HF = 0.018
const MOUSE_HL = MOUSE_LEN / 2
const SZ = 24
const SX = 16
const N = SX + 1

function floorY(t) {
  return 0.002 + t * 0.003
}

function ceilY(t) {
  if (t < 0.3) return MOUSE_HR - (MOUSE_HR - 0.026) * (t / 0.3)
  return 0.026 - (0.026 - MOUSE_HF) * ((t - 0.3) / 0.7)
}

function topY(x, z) {
  const t = (MOUSE_HL - z) / MOUSE_LEN
  const ax = Math.abs(x)
  if (ax >= MOUSE_HW || MOUSE_HW <= 0) return floorY(t)
  const d = ax / MOUSE_HW
  const dome = d < 0.7 ? 1 : 1 - ((d - 0.7) / 0.3) ** 2 * 0.25
  return floorY(t) + (ceilY(t) - floorY(t)) * dome
}

function makeBodyGeo() {
  const pos = []
  const idx = []
  const I = (a, b, c) => { idx.push(a, b, c) }
  const topCount = (SZ + 1) * N

  // Top surface: j=0..SZ, i=0..SX, z from +MOUSE_HL (rear) to -MOUSE_HL (front)
  for (let j = 0; j <= SZ; j++) {
    const z = MOUSE_HL - (j / SZ) * MOUSE_LEN
    for (let i = 0; i <= SX; i++) {
      const nx = (i / SX) * 2 - 1
      pos.push(nx * MOUSE_HW, topY(nx * MOUSE_HW, z), z)
    }
  }
  for (let j = 0; j < SZ; j++) {
    for (let i = 0; i < SX; i++) {
      const a = j * N + i
      I(a, a + 1, a + N)
      I(a + 1, a + N + 1, a + N)
    }
  }

  // Bottom surface: same grid at floor height
  for (let j = 0; j <= SZ; j++) {
    const z = MOUSE_HL - (j / SZ) * MOUSE_LEN
    for (let i = 0; i <= SX; i++) {
      const nx = (i / SX) * 2 - 1
      pos.push(nx * MOUSE_HW, floorY(j / SZ), z)
    }
  }
  for (let j = 0; j < SZ; j++) {
    for (let i = 0; i < SX; i++) {
      const a = topCount + j * N + i
      I(a, a + N, a + 1)
      I(a + N, a + N + 1, a + 1)
    }
  }

  // Rear wall at z = +MOUSE_HL (j=0): connect top row 0 to bottom row 0
  for (let i = 0; i < SX; i++) {
    I(i, topCount + i, i + 1)
    I(topCount + i, topCount + i + 1, i + 1)
  }

  // Front wall at z = -MOUSE_HL (j=SZ): connect top row SZ to bottom row SZ
  const bt = SZ * N
  const bb = topCount + SZ * N
  for (let i = 0; i < SX; i++) {
    I(bt + i + 1, bt + i, bb + i)
    I(bt + i + 1, bb + i, bb + i + 1)
  }

  // Left wall at x = -MOUSE_HW (i=0): outward normal = -X
  // Winding: tb→ba→ta and tb→bb2→ba → normal faces -X
  for (let j = 0; j < SZ; j++) {
    const ta = j * N
    const tb = ta + N
    const ba = topCount + j * N
    const bb2 = ba + N
    I(tb, ba, ta)
    I(tb, bb2, ba)
  }

  // Right wall at x = +MOUSE_HW (i=SX): outward normal = +X
  // Winding: ta→ba→tb and ba→bb2→tb → normal faces +X
  for (let j = 0; j < SZ; j++) {
    const ta = j * N + SX
    const tb = ta + N
    const ba = topCount + j * N + SX
    const bb2 = ba + N
    I(ta, ba, tb)
    I(ba, bb2, tb)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

function makeUnderGeo() {
  const inset = 0.0012
  const seam = 0.007
  const pos = []
  const idx = []
  const I = (a, b, c) => { idx.push(a, b, c) }
  const topCount = (SZ + 1) * N

  // Top ring at y=seam
  for (let j = 0; j <= SZ; j++) {
    const z = MOUSE_HL - (j / SZ) * MOUSE_LEN
    for (let i = 0; i <= SX; i++) {
      const nx = (i / SX) * 2 - 1
      pos.push(nx * (MOUSE_HW - inset), seam, z)
    }
  }

  // Bottom surface at floor height
  for (let j = 0; j <= SZ; j++) {
    const z = MOUSE_HL - (j / SZ) * MOUSE_LEN
    for (let i = 0; i <= SX; i++) {
      const nx = (i / SX) * 2 - 1
      pos.push(nx * (MOUSE_HW - inset), floorY(j / SZ), z)
    }
  }

  // Bottom surface triangles (facing -Y)
  for (let j = 0; j < SZ; j++) {
    for (let i = 0; i < SX; i++) {
      const a = topCount + j * N + i
      I(a, a + N, a + 1)
      I(a + N, a + N + 1, a + 1)
    }
  }

  // Rear wall (z=+MOUSE_HL)
  for (let i = 0; i < SX; i++) {
    I(i, topCount + i, i + 1)
    I(topCount + i, topCount + i + 1, i + 1)
  }

  // Front wall (z=-MOUSE_HL)
  const bt = SZ * N
  const bb = topCount + SZ * N
  for (let i = 0; i < SX; i++) {
    I(bt + i + 1, bt + i, bb + i)
    I(bt + i + 1, bb + i, bb + i + 1)
  }

  // Left wall (x = -(MOUSE_HW-inset))
  for (let j = 0; j < SZ; j++) {
    const ta = j * N
    const tb = ta + N
    const ba = topCount + j * N
    const bb2 = ba + N
    I(tb, ba, ta)
    I(tb, bb2, ba)
  }

  // Right wall (x = +(MOUSE_HW-inset))
  for (let j = 0; j < SZ; j++) {
    const ta = j * N + SX
    const tb = ta + N
    const ba = topCount + j * N + SX
    const bb2 = ba + N
    I(ta, ba, tb)
    I(ba, bb2, tb)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

function makePocketGeo() {
  const r = 0.010
  const seg = 16
  const rings = 6
  const Nc = seg + 1
  const pos = []
  const idx = []
  const I = (a, b, c) => { idx.push(a, b, c) }
  for (let j = 0; j <= rings; j++) {
    const v = j / rings
    const phi = v * Math.PI * 0.45
    const yy = -r * Math.cos(phi)
    const rr = r * Math.sin(phi)
    for (let i = 0; i <= seg; i++) {
      const u = (i / seg) * Math.PI * 2
      pos.push(Math.cos(u) * rr, yy, Math.sin(u) * rr)
    }
  }
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * Nc + i
      const b = a + Nc
      I(a, a + 1, b)
      I(b, a + 1, b + 1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

function makeBtnGeo(bw, bl, cxOff) {
  const depth = 0.0015
  const sx = 10
  const sz = 14
  const Nc = sx + 1
  const pos = []
  const idx = []
  const I = (a, b, c) => { idx.push(a, b, c) }
  const topN = (sz + 1) * Nc
  const hw = bw / 2
  const cx = cxOff
  const zFront = -MOUSE_HL + 0.001
  const zPivot = zFront + bl
  const zCenter = zPivot - bl / 2
  const cy = topY(cx, zCenter)

  // Top surface: lz from 0 (rear/pivot) to -bl (front edge)
  for (let j = 0; j <= sz; j++) {
    const lz = -(j / sz) * bl
    for (let i = 0; i <= sx; i++) {
      const lx = -hw + (i / sx) * bw
      pos.push(lx, topY(cx + lx, zPivot + lz) - cy + 0.0002, lz)
    }
  }
  // Bottom surface
  for (let j = 0; j <= sz; j++) {
    const lz = -(j / sz) * bl
    for (let i = 0; i <= sx; i++) {
      const lx = -hw + (i / sx) * bw
      pos.push(lx, topY(cx + lx, zPivot + lz) - cy + 0.0002 - depth, lz)
    }
  }

  // Top winding
  for (let j = 0; j < sz; j++) {
    for (let i = 0; i < sx; i++) {
      const a = j * Nc + i
      I(a, a + 1, a + Nc)
      I(a + 1, a + Nc + 1, a + Nc)
    }
  }
  // Bottom winding
  for (let j = 0; j < sz; j++) {
    for (let i = 0; i < sx; i++) {
      const a = topN + j * Nc + i
      I(a, a + Nc, a + 1)
      I(a + Nc, a + Nc + 1, a + 1)
    }
  }
  // j=0 wall (lz=0, rear/pivot edge)
  for (let i = 0; i < sx; i++) {
    I(i, topN + i, i + 1)
    I(topN + i, topN + i + 1, i + 1)
  }
  // j=sz wall (lz=-bl, front edge)
  const bt2 = sz * Nc
  const bbt = topN + sz * Nc
  for (let i = 0; i < sx; i++) {
    I(bt2 + i + 1, bt2 + i, bbt + i)
    I(bt2 + i + 1, bbt + i, bbt + i + 1)
  }
  // Left wall (lx=-hw)
  for (let j = 0; j < sz; j++) {
    const a = j * Nc
    I(a, a + Nc, topN + a)
    I(topN + a, a + Nc, topN + a + Nc)
  }
  // Right wall (lx=+hw)
  for (let j = 0; j < sz; j++) {
    const a = j * Nc + sx
    I(topN + a, a + Nc, a)
    I(topN + a + Nc, a + Nc, topN + a)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  geo.userData = { cx, cy, zPivot, bl }
  return geo
}

function makeReliefGeo() {
  const geo = new THREE.CylinderGeometry(0.0035, 0.0025, 0.010, 14, 1)
  geo.rotateX(Math.PI / 2)
  geo.translate(0, 0.014, -MOUSE_HL - 0.003)
  return geo
}

function makeMat(col, rough) {
  return new THREE.MeshStandardMaterial({
    color: col,
    roughness: rough,
    metalness: 0,
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  })
}

const matShell = makeMat('#eae6de', 0.78)
const matBottom = makeMat('#d5d0c8', 0.82)
const matBtn = makeMat('#f0ece4', 0.70)
const matCord = makeMat('#ddd8d0', 0.85)
const matBall = makeMat('#888888', 0.50)
matBall.metalness = 0.1

const bodyGeo = makeBodyGeo()
const underGeo = makeUnderGeo()
const pocketGeo = makePocketGeo()
const ballGeo = new THREE.SphereGeometry(0.009, 20, 20)
const leftBtnGeo = makeBtnGeo(0.022, 0.045, -0.016)
const rightBtnGeo = makeBtnGeo(0.022, 0.045, 0.016)
const reliefGeo = makeReliefGeo()

const mState = { bx: 0, bz: 0, tx: 0, tz: 0, lb: false, rb: false }

function attachEvents() {
  const mv = (e) => {
    if (document.pointerLockElement) {
      mState.tx += e.movementX * 0.0003
      mState.tz += e.movementY * 0.0003
    } else {
      mState.tx = mState.bx + ((e.clientX / window.innerWidth) * 2 - 1) * 0.15
      mState.tz = mState.bz + ((e.clientY / window.innerHeight) * 2 - 1) * 0.12
    }
    mState.tx = Math.max(mState.bx - 0.25, Math.min(mState.bx + 0.25, mState.tx))
    mState.tz = Math.max(mState.bz - 0.20, Math.min(mState.bz + 0.20, mState.tz))
  }
  const dn = (e) => {
    if (e.button === 0) mState.lb = true
    if (e.button === 2) mState.rb = true
  }
  const up = (e) => {
    if (e.button === 0) mState.lb = false
    if (e.button === 2) mState.rb = false
  }
  window.addEventListener('mousemove', mv)
  window.addEventListener('mousedown', dn)
  window.addEventListener('mouseup', up)
  return () => {
    window.removeEventListener('mousemove', mv)
    window.removeEventListener('mousedown', dn)
    window.removeEventListener('mouseup', up)
  }
}

function Cable({ anchorRef, deskY, startPos }) {
  const meshRef = useRef()
  const simRef = useRef(null)
  const tickRef = useRef(0)
  const SEG = 30
  const CBL = 0.60
  const SL = CBL / SEG
  const G = 9.81
  const SUB = 6
  const ITERS = 16
  const DAMP = 0.10
  const FRIC = 0.80
  const REST = 0.04
  const ANCHOR_OFF = [0.180, 0, -0.120]

  useEffect(() => {
    const pts = []
    const old = []
    const off = new THREE.Vector3(startPos[0], startPos[1], startPos[2])
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG
      const x = Math.sin(u * Math.PI * 1.5) * 0.006
      const z = -MOUSE_HL + 0.002 + u * -0.32
      const y = u * 0.012
      const p = new THREE.Vector3(x, y, z).add(off)
      pts.push(p.clone())
      old.push(p.clone())
    }
    const last = pts[SEG]
    const aw = new THREE.Vector3(last.x + ANCHOR_OFF[0], last.y + ANCHOR_OFF[1], last.z + ANCHOR_OFF[2])
    simRef.current = { pts, old, aw }
  }, [deskY, startPos.join(',')])

  useFrame((_, delta) => {
    const sim = simRef.current
    if (!sim) return
    const { pts, old, aw } = sim
    const dt = Math.min(delta, 0.033)
    const sdt = dt / SUB
    const mp = anchorRef.current
      ? new THREE.Vector3().setFromMatrixPosition(anchorRef.current.matrixWorld)
      : new THREE.Vector3(0, 0.014, -MOUSE_HL + 0.002)
    const ex = mp.clone()

    for (let s = 0; s < SUB; s++) {
      for (let i = 0; i <= SEG; i++) {
        if (i === 0) { pts[i].copy(ex); old[i].copy(ex); continue }
        if (i === SEG) { pts[i].copy(aw); old[i].copy(aw); continue }
        const vx = pts[i].x - old[i].x
        const vy = pts[i].y - old[i].y
        const vz = pts[i].z - old[i].z
        old[i].copy(pts[i])
        pts[i].x += vx * (1 - DAMP)
        pts[i].y += vy * (1 - DAMP) - G * sdt * sdt
        pts[i].z += vz * (1 - DAMP)
      }
      for (let k = 0; k < ITERS; k++) {
        for (let i = 0; i < SEG; i++) {
          const a = pts[i]
          const b = pts[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dz = b.z - a.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < 1e-8) continue
          const err = dist - SL
          const corr = err / dist * 0.5
          if (i > 0) { a.x += dx * corr; a.y += dy * corr; a.z += dz * corr }
          if (i < SEG - 1) { b.x -= dx * corr; b.y -= dy * corr; b.z -= dz * corr }
        }
        pts[0].copy(ex)
        pts[SEG].copy(aw)
        for (let i = 0; i <= SEG; i++) {
          if (pts[i].y < deskY) {
            const vx = pts[i].x - old[i].x
            const vz = pts[i].z - old[i].z
            pts[i].y = deskY
            pts[i].x -= vx * FRIC * 0.3
            pts[i].z -= vz * FRIC * 0.3
            old[i].y = deskY + (old[i].y - pts[i].y) * (1 - REST)
          }
        }
      }
    }

    if (meshRef.current) {
      tickRef.current++
      if ((tickRef.current % 2) === 0 && tickRef.current > 2) return
      const oldG = meshRef.current.geometry
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: SEG + 1 }, (_, i) => pts[i].clone()))
      meshRef.current.geometry = new THREE.TubeGeometry(curve, 20, 0.0015, 6, false)
      if (oldG) oldG.dispose()
    }
  })

  return <mesh ref={meshRef} material={matCord} castShadow />
}

function Btn({ geo, st }) {
  const ref = useRef()
  const { cx, cy, zPivot, bl } = geo.userData
  const TRAVEL = 0.0015
  const ANG = TRAVEL / bl

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const target = st.current
    if (!ref.current) return
    const cur = ref.current.rotation.x
    const dst = target ? ANG : 0
    const speed = target ? 25 : 12
    ref.current.rotation.x = THREE.MathUtils.damp(cur, dst, speed, d)
  })

  return (
    <group ref={ref} position={[cx, cy, zPivot]}>
      <mesh geometry={geo} material={matBtn} castShadow />
    </group>
  )
}

const lbRef = { current: 0 }
const rbRef = { current: 0 }

export function DevMouse({ position = [0, 0, 0], rotation, scale = 1, deskY = 0 }) {
  const bodyRef = useRef()
  const anchorRef = useRef()
  const idleRef = useRef(0)

  useEffect(() => {
    mState.bx = 0
    mState.bz = 0
    mState.tx = 0
    mState.tz = 0
    return attachEvents()
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const body = bodyRef.current
    if (!body) return
    const cx = body.position.x
    const cz = body.position.z
    body.position.x = THREE.MathUtils.damp(body.position.x, mState.tx, 22, dt)
    body.position.z = THREE.MathUtils.damp(body.position.z, mState.tz, 22, dt)
    const vx = (body.position.x - cx) / dt
    const vz = (body.position.z - cz) / dt
    body.rotation.z = THREE.MathUtils.damp(body.rotation.z, -vx * 0.15, 12, dt)
    body.rotation.x = THREE.MathUtils.damp(body.rotation.x, vz * 0.15, 12, dt)
    if (Math.sqrt(vx * vx + vz * vz) < 0.002) {
      idleRef.current += dt
      body.position.y = Math.sin(idleRef.current * 1.5) * 0.00015
    } else {
      idleRef.current = 0
      body.position.y = THREE.MathUtils.damp(body.position.y, 0, 15, dt)
    }
    lbRef.current = mState.lb ? 1 : 0
    rbRef.current = mState.rb ? 1 : 0
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        <group ref={anchorRef} position={[0, 0.014, -MOUSE_HL + 0.002]}>{null}</group>
        <mesh geometry={bodyGeo} material={matShell} castShadow receiveShadow />
        <mesh geometry={underGeo} material={matBottom} castShadow receiveShadow />
        <mesh geometry={pocketGeo} material={matBottom} position={[0, 0.002, -MOUSE_HL * 0.25]} />
        <mesh geometry={ballGeo} material={matBall} position={[0, -0.002, -MOUSE_HL * 0.25]} castShadow />
        <Btn geo={leftBtnGeo} st={lbRef} />
        <Btn geo={rightBtnGeo} st={rbRef} />
        <mesh geometry={reliefGeo} material={matCord} castShadow />
      </group>
      <Cable anchorRef={anchorRef} deskY={deskY} startPos={position} />
    </group>
  )
}

export default function DevStageMouse() {
  return (
    <>
      <color attach="background" args={['#08080a']} />
      <spotLight position={[-0.25, 0.50, 0.35]} angle={0.4} penumbra={0.7} intensity={3.5} color="#ffffff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
      <pointLight position={[0.35, 0.18, -0.15]} intensity={1.2} color="#8ab4f8" distance={1.5} />
      <pointLight position={[-0.18, 0.08, -0.40]} intensity={0.6} color="#c8d8ff" distance={1.0} />
      <ambientLight intensity={0.15} color="#d8d0c8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0005, 0.008]} receiveShadow onClick={(e) => { e.stopPropagation(); document.body.requestPointerLock() }}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshStandardMaterial color="#141416" roughness={0.85} metalness={0.1} />
      </mesh>
      <group>
        <DevMouse position={[0, 0.001, 0]} />
      </group>
      <DevOrbitControls target={[0, 0.012, 0]} minDistance={0.12} maxDistance={0.50} />
    </>
  )
}
