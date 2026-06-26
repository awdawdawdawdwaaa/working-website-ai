import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createCRTMaterial } from './crtShaders'
import DevBootText from './DevBootText'
import DevDesktop from './DevDesktop'

const FW = 0.55
const FH = FW * 0.85
const TD = 0.33
const FD = FW * 0.10
const COR = FW * 0.05
const RC = 0.92
const GB = FW * 0.04
const CONNECTOR_ANGLE = THREE.MathUtils.degToRad(50)

const SW = FW * 0.78
const SH = FH * 0.765
const OPEN_W = SW + 0.020
const OPEN_H = SH + 0.020
const THROAT_W = SW + 0.014
const THROAT_H = SH + 0.014
const SEAT_W = SW + 0.006
const SEAT_H = SH + 0.006

const BASE_H = 0.036
const STAND_H = 0.045
const BODY_BOTTOM = BASE_H + STAND_H
const BODY_Y = BODY_BOTTOM + FH / 2
const FRONT_Z = TD / 2
const REAR_Z = -TD / 2
const FRAME_Z = FRONT_Z - FD / 2
const BODY_JOIN_Z = FRONT_Z - FD - 0.004

const SCREEN_Z = FRONT_Z - 0.020
const BEZEL_FRONT_Z = FRONT_Z
const BEZEL_BACK_Z = FRONT_Z - FD * 0.14
const CONNECTOR_FRONT_Z = BEZEL_BACK_Z
const CONNECTOR_BACK_Z = SCREEN_Z
const SEAT_Z = SCREEN_Z + 0.0015
const GLASS_Z = SCREEN_Z

const SCREEN_ASSEMBLY_DOWN = 0.010
const SCREEN_Y = BODY_Y + FH * 0.045 - SCREEN_ASSEMBLY_DOWN

const ABS = '#d8cfbd'
const ABS_DARK = '#c8bea9'
const ABS_DEEP = '#b8ab94'

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function roundedRectShape(width, height, radius) {
  const hw = width / 2
  const hh = height / 2
  const r = Math.min(radius, hw, hh)
  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, hh)
  shape.lineTo(hw - r, hh)
  shape.quadraticCurveTo(hw, hh, hw, hh - r)
  shape.lineTo(hw, -hh + r)
  shape.quadraticCurveTo(hw, -hh, hw - r, -hh)
  shape.lineTo(-hw + r, -hh)
  shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r)
  shape.lineTo(-hw, hh - r)
  shape.quadraticCurveTo(-hw, hh, -hw + r, hh)
  return shape
}

function ringGeometry(outerW, outerH, outerR, innerW, innerH, innerR, depth, bevel = 0.004) {
  const outer = roundedRectShape(outerW, outerH, outerR)
  const hole = roundedRectShape(innerW, innerH, innerR)
  outer.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

function contourPoints(width, height, radius, total = 44) {
  const shape = roundedRectShape(width, height, radius)
  const points = shape.getSpacedPoints(total)
  points.pop()
  return points.map((point) => [point.x, point.y])
}

function bodyGeometry() {
  const rings = 16
  const points = contourPoints(FW * 0.94, FH * 0.92, COR, 48)
  const positions = []
  const indices = []
  const n = points.length

  for (let ring = 0; ring < rings; ring++) {
    const t = ring / (rings - 1)
    const compact = smoothstep(Math.max(0, (t - 0.24) / 0.76))
    const widthScale = 1 - compact * (1 - RC)
    const heightScale = 1 - compact * (1 - RC)
    const yOffset = -compact * 0.030
    const z = BODY_JOIN_Z - t * (BODY_JOIN_Z - REAR_Z)

    for (const [x, y] of points) {
      positions.push(x * widthScale, BODY_Y + y * heightScale + yOffset, z)
    }
  }

  for (let ring = 0; ring < rings - 1; ring++) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n
      const a = ring * n + i
      const b = ring * n + next
      const c = (ring + 1) * n + i
      const d = (ring + 1) * n + next
      indices.push(a, d, c)
      indices.push(a, b, d)
    }
  }

  const rearCenter = positions.length / 3
  positions.push(0, BODY_Y - 0.030, REAR_Z)
  const rearStart = (rings - 1) * n
  for (let i = 0; i < n; i++) {
    indices.push(rearCenter, rearStart + i, rearStart + ((i + 1) % n))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function connectorGeometry() {
  const numRings = 3
  const rings = [
    { points: contourPoints(OPEN_W, OPEN_H, COR, 48), z: CONNECTOR_FRONT_Z },
    { points: contourPoints(THROAT_W, THROAT_H, COR, 48), z: CONNECTOR_FRONT_Z + (CONNECTOR_BACK_Z - CONNECTOR_FRONT_Z) * 0.38 },
    { points: contourPoints(SEAT_W, SEAT_H, COR, 48), z: CONNECTOR_BACK_Z },
  ]
  const positions = []
  const indices = []
  const n = rings[0].points.length

  for (const ring of rings) {
    for (let i = 0; i < n; i++) {
      positions.push(ring.points[i][0], SCREEN_Y + ring.points[i][1], ring.z)
    }
  }

  for (let ring = 0; ring < numRings - 1; ring++) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n
      const a = ring * n + i
      const b = ring * n + next
      const c = (ring + 1) * n + i
      const d = (ring + 1) * n + next
      indices.push(a, b, c)
      indices.push(c, b, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function convexGlassGeometry() {
  const shape = roundedRectShape(SW, SH, COR)
  const geometry = new THREE.ShapeGeometry(shape, 40)
  const position = geometry.attributes.position
  const halfW = SW / 2
  const halfH = SH / 2

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const nx = x / halfW
    const ny = y / halfH
    const falloff = Math.max(0, 1 - nx * nx * 0.78 - ny * ny * 1.08)
    position.setZ(i, GB * falloff)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function OuterShell() {
  const geometry = useMemo(() => ringGeometry(FW, FH, COR, OPEN_W, OPEN_H, COR, FD, 0.002), [])
  return (
    <mesh name="CRT_OUTER_SHELL" position={[0, BODY_Y, FRAME_Z]} geometry={geometry} castShadow>
      <meshStandardMaterial color={ABS} roughness={0.82} metalness={0.004} side={THREE.DoubleSide} />
    </mesh>
  )
}

function RecessedBezel() {
  const bezelFD = FD * 0.14
  const geometry = useMemo(
    () => ringGeometry(OPEN_W + 0.034, OPEN_H + 0.030, COR, OPEN_W, OPEN_H, COR, bezelFD, 0.001),
    [],
  )
  return (
    <mesh name="CRT_RECESSED_BEZEL" position={[0, SCREEN_Y, BEZEL_FRONT_Z - bezelFD / 2]} geometry={geometry}>
      <meshStandardMaterial color={ABS_DARK} roughness={0.86} metalness={0.002} side={THREE.DoubleSide} />
    </mesh>
  )
}

function BodyShell() {
  const geometry = useMemo(bodyGeometry, [])
  return (
    <mesh name="CRT_BODY_SHELL" geometry={geometry} castShadow>
      <meshStandardMaterial color={ABS_DARK} roughness={0.86} metalness={0.004} />
    </mesh>
  )
}

function Connector() {
  const geometry = useMemo(connectorGeometry, [])
  return (
    <mesh name="CRT_CONNECTOR_SLOPE" geometry={geometry}>
      <meshStandardMaterial color={ABS_DEEP} roughness={0.90} metalness={0.002} side={THREE.DoubleSide} />
    </mesh>
  )
}

function ScreenSeatLip() {
  const geometry = useMemo(
    () => ringGeometry(SEAT_W + 0.028, SEAT_H + 0.028, COR, SEAT_W, SEAT_H, COR, 0.007, 0.001),
    [],
  )
  return (
    <mesh name="CRT_SCREEN_SEAT_LIP" position={[0, SCREEN_Y, SEAT_Z - 0.002]} geometry={geometry}>
      <meshStandardMaterial color={ABS_DEEP} roughness={0.92} metalness={0.002} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Glass() {
  const geometry = useMemo(convexGlassGeometry, [])
  return (
    <mesh name="CRT_CONVEX_GLASS" position={[0, SCREEN_Y, GLASS_Z]} geometry={geometry}>
      <meshPhysicalMaterial
        color="#a8bed0"
        roughness={0.03}
        metalness={0}
        transparent
        opacity={0.22}
        clearcoat={0.68}
        clearcoatRoughness={0.04}
        transmission={0.04}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function VentsAndBack() {
  const ventRows = Array.from({ length: 9 }, (_, i) => i)
  const topSlots = Array.from({ length: 22 }, (_, i) => i)

  return (
    <group name="CRT_VENTS_BACK">
      <group name="CRT_RIGHT_SIDE_VENTS" position={[FW * 0.405, BODY_Y + 0.030, -0.060]} rotation={[0, Math.PI / 2, 0]}>
        {ventRows.map((row) => (
          <mesh key={row} position={[0, 0.050 - row * 0.010, 0]}>
            <boxGeometry args={[0.150, 0.0024, 0.003]} />
            <meshBasicMaterial color="#28231d" transparent opacity={0.62} />
          </mesh>
        ))}
      </group>
      <group name="CRT_TOP_VENTS" position={[0, BODY_Y + FH * 0.438, -0.070]} rotation={[Math.PI / 2, 0, 0]}>
        {topSlots.map((slot) => (
          <mesh key={slot} position={[-0.145 + slot * 0.014, 0, 0]}>
            <boxGeometry args={[0.004, 0.130, 0.002]} />
            <meshBasicMaterial color="#2a251f" transparent opacity={0.58} />
          </mesh>
        ))}
      </group>
      <group name="CRT_REAR_DETAILS" position={[0, BODY_Y - 0.026, REAR_Z - 0.002]}>
        <mesh name="CRT_REAR_SERVICE_PANEL">
          <planeGeometry args={[FW * 0.56, FH * 0.44]} />
          <meshStandardMaterial color={ABS_DARK} roughness={0.92} metalness={0.004} side={THREE.DoubleSide} />
        </mesh>
        <mesh name="CRT_REAR_PANEL_SEAM" position={[0, 0, -0.001]}>
          <planeGeometry args={[FW * 0.60, FH * 0.48]} />
          <meshBasicMaterial color="#302a22" transparent opacity={0.10} side={THREE.DoubleSide} />
        </mesh>
        {[[-0.165, 0.115], [0.165, 0.115], [-0.165, -0.115], [0.165, -0.115]].map(([x, y], index) => (
          <mesh key={index} name="CRT_REAR_SERVICE_SCREW" position={[x, y, -0.003]}>
            <circleGeometry args={[0.004, 10]} />
            <meshBasicMaterial color="#5d5142" transparent opacity={0.52} />
          </mesh>
        ))}
        <mesh name="CRT_AC_SOCKET" position={[-0.170, -0.165, -0.004]}>
          <boxGeometry args={[0.046, 0.028, 0.006]} />
          <meshStandardMaterial color="#090909" roughness={0.62} metalness={0.05} />
        </mesh>
        <mesh name="CRT_REAR_PORTS" position={[0.080, -0.165, -0.004]}>
          <boxGeometry args={[0.100, 0.016, 0.005]} />
          <meshStandardMaterial color="#807664" roughness={0.74} metalness={0.10} />
        </mesh>
      </group>
    </group>
  )
}

function IntegratedStand() {
  return (
    <group name="CRT_INTEGRATED_STAND">
      <mesh name="CRT_STAND_NECK_BOX" position={[0, BASE_H + STAND_H * 0.48, 0.010]} castShadow receiveShadow>
        <boxGeometry args={[FW * 0.58, STAND_H, TD * 0.54]} />
        <meshStandardMaterial color={ABS_DEEP} roughness={0.86} metalness={0.003} />
      </mesh>
      <mesh name="CRT_STAND_SHADOW_GAP" position={[0, BASE_H + 0.004, 0.012]}>
        <boxGeometry args={[FW * 0.64, 0.009, TD * 0.58]} />
        <meshBasicMaterial color="#17130f" transparent opacity={0.44} />
      </mesh>
      <mesh name="CRT_WIDE_STABLE_BASE" position={[0, BASE_H / 2, 0.010]} castShadow receiveShadow>
        <boxGeometry args={[FW * 0.64, BASE_H, TD * 0.58]} />
        <meshStandardMaterial color={ABS_DARK} roughness={0.87} metalness={0.003} />
      </mesh>
      <mesh name="CRT_BASE_FRONT_LIP" position={[0, BASE_H * 0.98, FRONT_Z * 0.58]}>
        <boxGeometry args={[FW * 0.68, 0.010, 0.020]} />
        <meshStandardMaterial color={ABS} roughness={0.84} metalness={0.003} />
      </mesh>
    </group>
  )
}

export default function DevCRT({
  position = [0, 0.782, -0.020],
  boot,
  onBootComplete,
  bootComplete,
  reflectionAmount,
}) {
  const matRef = useRef(null)
  const tRef = useRef(bootComplete ? 15 : 0)
  const bootRef = useRef(bootComplete ? 1 : 0)
  const startedRef = useRef(!!boot || !!bootComplete)
  const doneRef = useRef(!!bootComplete)
  const [phase, setPhase] = useState(bootComplete ? 'desktop' : 'off')

  const screenGeometry = useMemo(() => new THREE.PlaneGeometry(SW, SH), [])
  const material = useMemo(() => {
    const mat = createCRTMaterial()
    matRef.current = mat
    if (bootComplete) {
      mat.uniforms.uBoot.value = 1
      mat.uniforms.uDesktopAlpha.value = 1
      mat.uniforms.uTextAlpha.value = 0
      mat.uniforms.uReflect.value = reflectionAmount != null ? 0.55 * reflectionAmount : 0.55
    }
    return mat
  }, [bootComplete, reflectionAmount])

  useEffect(() => {
    if (bootComplete) return
    if (!boot || startedRef.current) return
    startedRef.current = true
    bootRef.current = 0
    tRef.current = 0
  }, [boot, bootComplete])

  useFrame((_, delta) => {
    if (!startedRef.current || bootComplete) return

    tRef.current += delta
    const previous = bootRef.current
    bootRef.current = Math.min(1, bootRef.current + delta * 0.065)

    if (previous < 0.12 && bootRef.current >= 0.12) setPhase('flash')
    if (previous < 0.20 && bootRef.current >= 0.20) setPhase('line')
    if (previous < 0.35 && bootRef.current >= 0.35) setPhase('expand')
    if (previous < 0.55 && bootRef.current >= 0.55) setPhase('glow')
    if (previous < 0.70 && bootRef.current >= 0.70) setPhase('text')
    if (previous < 0.90 && bootRef.current >= 0.90) setPhase('desktop')
    if (previous < 1.0 && bootRef.current >= 1.0 && !doneRef.current) {
      doneRef.current = true
      onBootComplete?.()
    }

    if (matRef.current) {
      const mat = matRef.current
      mat.uniforms.uTime.value = tRef.current
      mat.uniforms.uBoot.value = bootRef.current
      if (bootRef.current >= 0.70 && bootRef.current < 0.90) {
        mat.uniforms.uTextAlpha.value = Math.min(1, (bootRef.current - 0.70) / 0.05)
      }
      if (bootRef.current >= 0.90) {
        mat.uniforms.uDesktopAlpha.value = Math.min(1, (bootRef.current - 0.90) / 0.10)
        mat.uniforms.uTextAlpha.value = Math.max(0, 1 - (bootRef.current - 0.90) / 0.05)
      }
      const baseReflect = Math.min(0.6, bootRef.current * 0.8 + 0.15)
      mat.uniforms.uReflect.value = reflectionAmount != null ? baseReflect * reflectionAmount : baseReflect
    }
  })

  const handleTextTexture = useMemo(() => (texture) => {
    if (matRef.current) matRef.current.uniforms.uTextTex.value = texture
  }, [])

  const handleDesktopTexture = useMemo(() => (texture) => {
    if (matRef.current) matRef.current.uniforms.uDesktopTex.value = texture
  }, [])

  return (
    <group name="CRT_MONITOR" position={position}>
      <BodyShell />
      <OuterShell />
      <RecessedBezel />
      <Connector />
      <ScreenSeatLip />
      <mesh name="CRT_SCREEN_UI_UNCHANGED" position={[0, SCREEN_Y, SCREEN_Z]} geometry={screenGeometry} material={material} />
      <Glass />
      <VentsAndBack />
      <IntegratedStand />
      {phase === 'text' && <DevBootText onTextureReady={handleTextTexture} />}
      {phase === 'desktop' && <DevDesktop onTextureReady={handleDesktopTexture} />}
    </group>
  )
}
