import { useEffect, useMemo, useRef, useState } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createCRTMaterial } from './crtShaders'
import DevBootText from './DevBootText'
import DevDesktop from './DevDesktop'

const FRONT_W = 0.66
const FRONT_H = 0.50
const BODY_D = 0.28
const BODY_BOTTOM = 0.016
const BODY_Y = BODY_BOTTOM + FRONT_H / 2
const FRONT_Z = BODY_D / 2

const SCREEN_W = FRONT_W * 0.73
const SCREEN_H = FRONT_H * 0.61
const OPEN_W = SCREEN_W + 0.044
const OPEN_H = SCREEN_H + 0.044
const SCREEN_Y = BODY_Y + FRONT_H * 0.040
const FRAME_DEPTH = 0.032
const FRAME_Z = FRONT_Z + FRAME_DEPTH / 2
const SCREEN_Z = FRONT_Z + 0.009
const GLASS_Z = SCREEN_Z + 0.003

const ABS = '#ded7ca'
const ABS_DARK = '#cfc5b3'
const ABS_DEEP = '#b7aa94'

function roundedRectShape(width, height, radius, centerY = 0) {
  const hw = width / 2
  const hh = height / 2
  const r = Math.min(radius, hw, hh)
  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, centerY + hh)
  shape.lineTo(hw - r, centerY + hh)
  shape.quadraticCurveTo(hw, centerY + hh, hw, centerY + hh - r)
  shape.lineTo(hw, centerY - hh + r)
  shape.quadraticCurveTo(hw, centerY - hh, hw - r, centerY - hh)
  shape.lineTo(-hw + r, centerY - hh)
  shape.quadraticCurveTo(-hw, centerY - hh, -hw, centerY - hh + r)
  shape.lineTo(-hw, centerY + hh - r)
  shape.quadraticCurveTo(-hw, centerY + hh, -hw + r, centerY + hh)
  return shape
}

function contourPoints(width, height, radius, total = 52) {
  const shape = roundedRectShape(width, height, radius)
  const points = shape.getSpacedPoints(total)
  points.pop()
  return points.map((point) => [point.x, point.y])
}

function ringGeometry(outerW, outerH, outerR, innerW, innerH, innerR, depth, bevel = 0.003, innerYOffset = 0) {
  const outer = roundedRectShape(outerW, outerH, outerR)
  const hole = roundedRectShape(innerW, innerH, innerR, innerYOffset)
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

function throatGeometry() {
  const rings = [
    { points: contourPoints(OPEN_W, OPEN_H, 0.012, 52), z: FRAME_Z + FRAME_DEPTH / 2 - 0.003 },
    { points: contourPoints(SCREEN_W + 0.012, SCREEN_H + 0.012, 0.010, 52), z: SCREEN_Z + 0.001 },
  ]
  const positions = []
  const indices = []
  const n = rings[0].points.length

  for (const ring of rings) {
    for (const [x, y] of ring.points) {
      positions.push(x, SCREEN_Y + y, ring.z)
    }
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    indices.push(i, next, n + i)
    indices.push(n + i, next, n + next)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function glassGeometry() {
  const shape = roundedRectShape(SCREEN_W, SCREEN_H, 0.012)
  const geometry = new THREE.ShapeGeometry(shape, 44)
  const position = geometry.attributes.position
  const halfW = SCREEN_W / 2
  const halfH = SCREEN_H / 2

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i) / halfW
    const y = position.getY(i) / halfH
    const falloff = Math.max(0, 1 - x * x * 0.72 - y * y * 0.95)
    position.setZ(i, falloff * 0.006)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function FrontOnlyShell() {
  const frame = useMemo(
    () => ringGeometry(FRONT_W, FRONT_H, 0.014, OPEN_W, OPEN_H, 0.012, FRAME_DEPTH, 0.002, SCREEN_Y - BODY_Y),
    [],
  )
  const throat = useMemo(throatGeometry, [])

  return (
    <group name="CRT20_FRONT_ONLY_BODY">
      <RoundedBox
        name="CRT20_UPPER_BODY_BLOCK"
        args={[FRONT_W, FRONT_H, BODY_D]}
        radius={0.014}
        smoothness={5}
        position={[0, BODY_Y, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={ABS_DARK} roughness={0.84} metalness={0.004} />
      </RoundedBox>
      <mesh name="CRT20_CLEAN_FRONT_FRAME" position={[0, BODY_Y, FRAME_Z]} geometry={frame} castShadow>
        <meshStandardMaterial color={ABS} roughness={0.82} metalness={0.004} side={THREE.DoubleSide} />
      </mesh>
      <mesh name="CRT20_BEIGE_SCREEN_THROAT" geometry={throat} castShadow>
        <meshStandardMaterial color={ABS_DEEP} roughness={0.88} metalness={0.003} side={THREE.DoubleSide} />
      </mesh>
      <mesh name="CRT20_BOTTOM_FACE_LINE" position={[0, BODY_BOTTOM + 0.070, FRAME_Z + 0.018]}>
        <boxGeometry args={[FRONT_W * 0.91, 0.010, 0.006]} />
        <meshStandardMaterial color={ABS_DEEP} roughness={0.86} metalness={0.003} />
      </mesh>
      <mesh name="CRT20_POWER_BUTTON" position={[FRONT_W * 0.410, BODY_BOTTOM + 0.061, FRAME_Z + 0.024]} castShadow>
        <boxGeometry args={[0.034, 0.026, 0.010]} />
        <meshStandardMaterial color="#d6cebd" roughness={0.78} metalness={0.003} />
      </mesh>
      <mesh name="CRT20_POWER_BUTTON_GAP" position={[FRONT_W * 0.410, BODY_BOTTOM + 0.061, FRAME_Z + 0.030]}>
        <boxGeometry args={[0.039, 0.031, 0.002]} />
        <meshBasicMaterial color="#51483b" transparent opacity={0.22} />
      </mesh>
    </group>
  )
}

function Glass() {
  const geometry = useMemo(glassGeometry, [])

  return (
    <mesh name="CRT20_SOFT_CONVEX_GLASS" position={[0, SCREEN_Y, GLASS_Z]} geometry={geometry}>
      <meshPhysicalMaterial
        color="#9fb3a7"
        roughness={0.06}
        metalness={0}
        transparent
        opacity={0.18}
        clearcoat={0.7}
        clearcoatRoughness={0.05}
        transmission={0.04}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function DevCRT20({
  position = [0, 0, 0],
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

  const screenGeometry = useMemo(() => new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), [])
  const material = useMemo(() => {
    const mat = createCRTMaterial({ fillScreen: true, barrelStrength: 0 })
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
    <group name="CRT_MONITOR_2_0_FRONT_ONLY" position={position}>
      <FrontOnlyShell />
      <mesh name="CRT20_SCREEN_FILLED_TEXTURE" position={[0, SCREEN_Y, SCREEN_Z]} geometry={screenGeometry} material={material} />
      <Glass />
      {phase === 'text' && <DevBootText onTextureReady={handleTextTexture} />}
      {phase === 'desktop' && <DevDesktop onTextureReady={handleDesktopTexture} />}
    </group>
  )
}
