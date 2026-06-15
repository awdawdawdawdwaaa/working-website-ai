import { useFrame } from '@react-three/fiber'
import { useRef }   from 'react'
import * as THREE   from 'three'

function damp(ref, target, speed = 0.05) {
  if (!ref.current) return
  ref.current.intensity = THREE.MathUtils.lerp(ref.current.intensity, target, speed)
}

const ZONES = [
  { key: 'ZONE_A', z:  8.0, wall: 'right' },
  { key: 'ZONE_B', z: 16.0, wall: 'left' },
  { key: 'ZONE_C', z: 24.0, wall: 'right' },
  { key: 'ZONE_D', z: 32.0, wall: 'left' },
  { key: 'ZONE_E', z: 38.0, wall: 'right' },
]

function ZoneLight({ zone, progress }) {
  const spotRef = useRef(null)
  const wallRef = useRef(null)
  
  // Corridor goes from 0 to 45
  const zoneProgress = zone.z / 45
  const dist = Math.abs(progress - zoneProgress)
  const active = dist < 0.15

  const isRight = zone.wall === 'right'
  const wx = isRight ?  2.30 : -2.30
  const cx = isRight ?  0.55 : -0.55
  const CEIL = 4.40

  useFrame(() => {
    const intensity = active ? 1 : 0
    damp(spotRef, intensity * 11.0, 0.06)
    damp(wallRef, intensity *  4.5, 0.06)
  })

  return (
    <group>
      <spotLight
        ref={spotRef}
        position={[cx, CEIL, zone.z]}
        angle={0.42} penumbra={0.55}
        intensity={0} color="#f8f0e4"
        distance={8} castShadow
        target-position={[wx, 1.5, zone.z]}
      />
      <pointLight ref={wallRef} position={[wx, 3.2, zone.z]}  color="#f0e8d8" intensity={0} distance={5} decay={2} />
    </group>
  )
}

export default function LightingRig({ progress }) {
  const ambRef       = useRef(null)
  const introKey     = useRef(null)
  const corridorFill = useRef(null)
  const corridorTop  = useRef(null)
  const lampRef      = useRef(null)
  const monitorRef   = useRef(null)

  useFrame(() => {
    const intro = 1 - THREE.MathUtils.smoothstep(progress, 0.075, 0.170)

    // Low ambient keeps the opening corridor dark and lets the line drive focus.
    damp(ambRef, 0.18 + progress * 0.12, 0.04)
    damp(introKey, intro * 4.2, 0.06)

    // Corridor fill
    const inCorridor = progress < 0.8
    damp(corridorFill, inCorridor ? 3.6 : 1.4, 0.04)
    damp(corridorTop,  inCorridor ? 2.1 : 1.0, 0.04)

    // Room lights — reduced for calmer atmosphere
    const atDesk = progress > 0.8
    damp(lampRef,    atDesk ? 1.0 : 0, 0.04)
    damp(monitorRef, atDesk ? 1.2 : 0, 0.05)
  })

  return (
    <>
      <ambientLight ref={ambRef} color="#3a3428" intensity={0.4} />

      <spotLight
        ref={introKey}
        position={[0, 2.05, 2.60]}
        angle={0.34} penumbra={0.78}
        intensity={0}
        color="#f3e0c0"
        distance={4.5}
        castShadow
        target-position={[0, 1.58, 0.24]}
      />

      <spotLight
        ref={corridorFill}
        position={[0, 4.8, 20]}
        angle={0.90} penumbra={0.98}
        intensity={0}
        color="#ddd8d0"
        distance={52}
        target-position={[0, 0, 20]}
      />
      <pointLight ref={corridorTop} position={[0, 4.6, 10]} color="#d4cec6" intensity={0} distance={42} decay={0.8} />

      {ZONES.map(zone => <ZoneLight key={zone.key} zone={zone} progress={progress} />)}

      <spotLight
        ref={lampRef}
        position={[-0.70, 1.48, 47.44]}
        angle={0.58} penumbra={0.72}
        color="#ffd06a"
        intensity={0}
        distance={5.5}
        castShadow
        target-position={[0, 0.78, 47.5]}
      />
      <pointLight ref={monitorRef} position={[0, 1.28, 46.1]} color="#b0ccf0" intensity={0} distance={4.5} decay={1.8} />
    </>
  )
}
