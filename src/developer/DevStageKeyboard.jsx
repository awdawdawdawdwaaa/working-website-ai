import { useEffect, useMemo, useState, useRef } from 'react'
import * as THREE from 'three'
import { Text, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import DevOrbitControls from './DevOrbitControls'

const UNIT         = 0.0190
const GAP          = 0.0028
const PITCH        = UNIT + GAP
const CHASSIS_FRONT = 0.028
const CHASSIS_BACK  = 0.055
const KEY_H        = 0.016
const CAL_W        = 0.484

const BODY_W = CAL_W + 0.024
const BODY_D = 0.142
const HAFT_W = BODY_W / 2
const HAFT_D = BODY_D / 2

function sp(u) { return { type: 'spacer', u } }
function k(label, u = 1, h = 1) { return { label, u, h } }

function buildLayout() {
  const keys = []
  const MX = 0
  const NX = MX + 15 * PITCH
  const UX = NX + 3 * PITCH + 0.006

  const RAW = [
    PITCH * 1.8,
    PITCH * 0.8,
    -PITCH * 0.2,
    -PITCH * 1.2,
    -PITCH * 2.2,
    -PITCH * 3.4,
  ]
  const mid = (RAW[0] + RAW[5]) / 2
  const shift = -mid
  const R = RAW.map(v => v + shift)

  function addRow(sx, z, ri, items) {
    let x = sx
    for (const it of items) {
      if (it.type === 'spacer') { x += it.u * UNIT + Math.max(0, it.u - 1) * GAP + GAP; continue }
      const w = it.u * UNIT + Math.max(0, it.u - 1) * GAP
      const dh = it.h * UNIT + Math.max(0, it.h - 1) * GAP
      const az = z + (it.h > 1 ? PITCH * (it.h - 1) / 2 : 0)
      keys.push({ label: it.label, x: x + w / 2, z: -az, w, dh, ri })
      x += w + GAP
    }
  }

  addRow(MX, R[0], 0, [k('ESC'),sp(0.5),sp(0.5),k('F1'),k('F2'),k('F3'),k('F4'),sp(0.5),sp(0.5),k('F5'),k('F6'),k('F7'),k('F8'),sp(0.5),sp(0.5),k('F9'),k('F10'),k('F11'),k('F12')])
  addRow(NX, R[0], 0, [sp(1.5),k('PRT'),k('SCR'),k('PAU')])

  addRow(MX, R[1], 1, [k('`'),k('1'),k('2'),k('3'),k('4'),k('5'),k('6'),k('7'),k('8'),k('9'),k('0'),k('-'),k('='),k('BKSP',2)])
  addRow(NX, R[1], 1, [k('INS'),k('HOM'),k('PGU')])
  addRow(UX, R[1], 1, [k('NUM'),k('/'),k('*'),k('-')])

  addRow(MX, R[2], 2, [k('TAB',1.5),k('Q'),k('W'),k('E'),k('R'),k('T'),k('Y'),k('U'),k('I'),k('O'),k('P'),k('['),k(']'),k('\\',1.5)])
  addRow(NX, R[2], 2, [k('DEL'),k('END'),k('PGD')])
  addRow(UX, R[2], 2, [k('7'),k('8'),k('9'),k('+',1,2)])

  addRow(MX, R[3], 3, [k('CAPS',1.75),k('A'),k('S'),k('D'),k('F'),k('G'),k('H'),k('J'),k('K'),k('L'),k(';'),k("'"),k('ENT',2.25)])
  addRow(UX, R[3], 3, [k('4'),k('5'),k('6')])

  addRow(MX, R[4], 4, [k('SHFT',2.25),k('Z'),k('X'),k('C'),k('V'),k('B'),k('N'),k('M'),k(','),k('.'),k('/'),k('SHFT',2.75)])
  addRow(NX, R[4], 4, [sp(1),k('UP'),sp(1)])
  addRow(UX, R[4], 4, [k('1'),k('2'),k('3'),k('ENT',1,2)])

  addRow(MX, R[5], 5, [k('CTRL',1.25),k('WIN',1.25),k('ALT',1.25),k('SPC',6.25),k('ALT',1.25),k('WIN',1.25),k('MENU',1.25),k('CTRL',1.25)])
  addRow(NX, R[5], 5, [k('LFT'),k('DWN'),k('RGT')])
  addRow(UX, R[5], 5, [k('0',2),k('.')])

  return keys
}

const kcm = {
  ' ': 'SPC', Space: 'SPC', Escape: 'ESC', Backspace: 'BKSP', Enter: 'ENT', Tab: 'TAB',
  CapsLock: 'CAPS', ShiftLeft: 'SHFT', ShiftRight: 'SHFT',
  ControlLeft: 'CTRL', ControlRight: 'CTRL',
  AltLeft: 'ALT', AltRight: 'ALT',
  MetaLeft: 'WIN', MetaRight: 'WIN',
  ContextMenu: 'MENU',
  ArrowUp: 'UP', ArrowDown: 'DWN', ArrowLeft: 'LFT', ArrowRight: 'RGT',
  Insert: 'INS', Delete: 'DEL', Home: 'HOM', End: 'END',
  PageUp: 'PGU', PageDown: 'PGD',
  NumLock: 'NUM', PrintScreen: 'PRT', ScrollLock: 'SCR', Pause: 'PAU',
}

function normalise(e) {
  if (kcm[e.code]) return kcm[e.code]
  if (/^F\d{1,2}$/.test(e.key)) return e.key
  if (e.key.length === 1) return e.key.toUpperCase()
  return ''
}

function usePressedKeys() {
  const [pressed, set] = useState(() => new Set())
  useEffect(() => {
    const add = (e) => { const l = normalise(e); if (l) set(p => new Set([...p, l])) }
    const del = (e) => { const l = normalise(e); if (l) set(p => { const n = new Set(p); n.delete(l); return n }) }
    const clr = () => set(new Set())
    window.addEventListener('keydown', add)
    window.addEventListener('keyup', del)
    window.addEventListener('blur', clr)
    return () => { window.removeEventListener('keydown', add); window.removeEventListener('keyup', del); window.removeEventListener('blur', clr) }
  }, [])
  return pressed
}

function sculptedKeyGeo(w, d, tilt) {
  const geo = new THREE.BoxGeometry(w, KEY_H, d, 6, 1, 1)
  geo.translate(0, KEY_H / 2, 0)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    if (y > KEY_H * 0.75) {
      y += z * Math.tan(tilt)
      const nx = x / (w / 2)
      const nz = z / (d / 2)
      y -= (1 - nx * nx) * 0.0016
      y -= (1 - nz * nz) * 0.0008
      x *= 0.90; z *= 0.92
    }
    p.setXYZ(i, x, y, z)
  }
  p.needsUpdate = true; geo.computeVertexNormals(); return geo
}

const ROW_TILT = [0.16, 0.12, 0.07, 0, -0.05, -0.09]

function Keycap({ x, z, w, dh, label, pressed, ri = 2 }) {
  const tilt = ROW_TILT[ri] ?? 0.04
  const geo = useMemo(() => sculptedKeyGeo(w - GAP, dh - GAP, tilt), [w, dh, tilt])
  const ref = useRef(null)
  const isPressed = pressed
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, isPressed ? keyY - 0.004 : keyY, 30, delta)
    }
  })
  const col = isPressed ? '#d5d0c2' : '#e3dfd2'
  const hd = BODY_D / 2
  const t = Math.max(0, Math.min(1, (z + hd) / (2 * hd)))
  const chassisH = CHASSIS_BACK - (CHASSIS_BACK - CHASSIS_FRONT) * t
  const keyY = chassisH + 0.004
  return (
    <group position={[x, 0, z]}>
      <group ref={ref} position={[0, keyY, 0]}>
        <mesh castShadow receiveShadow geometry={geo}>
          <meshStandardMaterial color={col} roughness={0.55} metalness={0} />
        </mesh>
        <Text position={[0, KEY_H + 0.0003, 0]} rotation={[-Math.PI / 2 + tilt, 0, 0]} fontSize={0.0042} color="#333" anchorX="center" anchorY="middle">{label}</Text>
      </group>
    </group>
  )
}

function wedgeGeo(bodyW, bodyD) {
  const hw = bodyW / 2, hd = bodyD / 2
  const fh = CHASSIS_FRONT, bh = CHASSIS_BACK
  const v = new Float32Array([
    -hw, 0, -hd,   hw, 0, -hd,   hw, 0, hd,   -hw, 0, hd,
    -hw, bh, -hd,  hw, bh, -hd,  hw, fh, hd,   -hw, fh, hd,
  ])
  const idx = [
    0, 2, 3,  0, 1, 2,
    4, 6, 5,  4, 7, 6,
    3, 2, 6,  3, 6, 7,
    1, 0, 4,  1, 4, 5,
    0, 7, 4,  0, 3, 7,
    2, 1, 5,  2, 5, 6,
  ]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function KBChassis({ bodyW, bodyD }) {
  const geo = useMemo(() => wedgeGeo(bodyW, bodyD), [bodyW, bodyD])
  const hd = bodyD / 2
  return (
    <group name="KB_CASE">
      <mesh name="KB_CHASSIS" geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#c8c4b8" roughness={0.58} metalness={0} />
      </mesh>
      <RoundedBox name="KB_FRONT_LIP" args={[bodyW + 0.002, 0.005, 0.008]} radius={0.003} smoothness={4} position={[0, CHASSIS_FRONT / 2, hd + 0.003]} castShadow receiveShadow>
        <meshStandardMaterial color="#c8c4b8" roughness={0.58} metalness={0} />
      </RoundedBox>
      <RoundedBox name="KB_REAR_BUMP" args={[bodyW - 0.025, 0.008, 0.015]} radius={0.003} smoothness={4} position={[0, CHASSIS_BACK - 0.002, -(hd - 0.005)]} castShadow receiveShadow>
        <meshStandardMaterial color="#cbc7bb" roughness={0.62} metalness={0} />
      </RoundedBox>
      <mesh name="KB_UNDER_L" position={[-(bodyW / 2 - 0.002), -0.001, 0]} castShadow>
        <boxGeometry args={[0.006, 0.006, bodyD - 0.010]} />
        <meshStandardMaterial color="#bcb8ac" roughness={0.65} metalness={0} />
      </mesh>
      <mesh name="KB_UNDER_R" position={[bodyW / 2 - 0.002, -0.001, 0]} castShadow>
        <boxGeometry args={[0.006, 0.006, bodyD - 0.010]} />
        <meshStandardMaterial color="#bcb8ac" roughness={0.65} metalness={0} />
      </mesh>
    </group>
  )
}

function KeyboardCable({ kbRef }) {
  const [geometry, setGeometry] = useState(null)

  useEffect(() => {
    if (!kbRef.current) return

    const ex = new THREE.Vector3(0, CHASSIS_BACK * 0.35, -(HAFT_D + 0.001))
    ex.applyMatrix4(kbRef.current.matrixWorld)

    const wp = new THREE.Vector3()
    kbRef.current.getWorldPosition(wp)
    const deskY = wp.y

    const pcA = new THREE.Vector3(0.70, 0.90, -0.250)

    const pts = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11
      if (i === 0) return ex.clone()
      if (i === 11) return pcA.clone()

      const p = new THREE.Vector3().lerpVectors(ex, pcA, t)
      const bulge = Math.sin(t * Math.PI) * 0.22
      p.x += bulge
      p.z += Math.sin(t * Math.PI * 2.4) * 0.025
      const drift = t * t * 0.04
      p.z += drift

      if (t < 0.10) {
        p.y = ex.y + (deskY - ex.y) * (t / 0.10)
      } else if (t < 0.80) {
        p.y = deskY
      } else {
        const rt = (t - 0.80) / 0.20
        p.y = deskY + (pcA.y - deskY) * rt
      }
      return p
    })

    pts[1] = new THREE.Vector3(ex.x, deskY, ex.z + 0.010)
    pts[2] = new THREE.Vector3(ex.x + 0.04, deskY, ex.z + 0.006)

    const curve = new THREE.CatmullRomCurve3(pts)
    const g = new THREE.TubeGeometry(curve, 48, 0.0022, 8, false)
    setGeometry(g)
  }, [])

  return geometry ? <mesh geometry={geometry} castShadow><meshStandardMaterial color="#d5d0c2" roughness={0.88} metalness={0} /></mesh> : null
}

export default function DevStageKeyboard() {
  return (
    <>
      <color attach="background" args={['#0a0908']} />
      <spotLight position={[0.25, 0.60, 0.55]} angle={0.40} penumbra={0.58} intensity={3.2} color="#ffe4c0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-0.45, 0.35, 0.35]} intensity={0.55} color="#c8d8ff" distance={2.0} />
      <ambientLight intensity={0.10} color="#d8d0c8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[1.40, 0.80]} />
        <meshStandardMaterial color="#4a4034" roughness={0.66} metalness={0.02} />
      </mesh>
      <DevKeyboard position={[0, 0, 0.010]} />
      <DevOrbitControls target={[0, 0.012, 0.010]} minDistance={0.22} maxDistance={1.40} />
    </>
  )
}

export function DevKeyboard({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, interactive = true }) {
  const pressed = usePressedKeys()
  const layout = useMemo(() => {
    const result = buildLayout()
    if (!result || !Array.isArray(result) || result.length === 0) return { rows: [], offX: 0, offZ: 0 }
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
    for (const k of result) {
      if (k.x < minX) minX = k.x
      if (k.x > maxX) maxX = k.x
      if (k.z < minZ) minZ = k.z
      if (k.z > maxZ) maxZ = k.z
    }
    return { rows: result, offX: -(minX + maxX) / 2, offZ: -(minZ + maxZ) / 2 }
  }, [])
  const { rows, offX, offZ } = layout
  const innerRef = useRef(null)

  return <>
    <group name="DEV_KEYBOARD" position={position} rotation={rotation} scale={scale}>
      <group ref={innerRef}>
        <KBChassis bodyW={BODY_W} bodyD={BODY_D} />
        {rows.map(rk => (
          <Keycap key={`${rk.label}-${rk.x.toFixed(4)}-${rk.z.toFixed(4)}`}
            x={rk.x + offX} z={rk.z + offZ} w={rk.w} dh={rk.dh}
            label={rk.label} pressed={interactive && pressed.has(rk.label)} ri={rk.ri} />
        ))}
        <mesh name="KB_PORT" position={[0, CHASSIS_BACK * 0.35, -(HAFT_D + 0.001)]}>
          <boxGeometry args={[0.025, 0.006, 0.005]} />
          <meshStandardMaterial color="#555" roughness={0.8} />
        </mesh>
        <mesh name="KB_FEET_F" position={[-HAFT_W * 0.38, -0.001, HAFT_D - 0.010]}>
          <boxGeometry args={[0.010, 0.0015, 0.010]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh name="KB_FEET_F" position={[HAFT_W * 0.38, -0.001, HAFT_D - 0.010]}>
          <boxGeometry args={[0.010, 0.0015, 0.010]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh name="KB_FEET_R" position={[-HAFT_W * 0.38, -0.001, -(HAFT_D - 0.010)]}>
          <boxGeometry args={[0.010, 0.005, 0.010]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh name="KB_FEET_R" position={[HAFT_W * 0.38, -0.001, -(HAFT_D - 0.010)]}>
          <boxGeometry args={[0.010, 0.005, 0.010]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </group>
    <KeyboardCable kbRef={innerRef} />
  </>
}
