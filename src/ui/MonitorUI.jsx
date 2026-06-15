import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const LABELS = [
  { text: 'Past Projects', y: 0.090 },
  { text: 'Current Projects', y: -0.020 },
  { text: 'Future Projects', y: -0.130 },
]

export default function MonitorUI({ progress = 0 }) {
  const groupRef = useRef(null)
  const boot = THREE.MathUtils.smoothstep(progress, 0.06, 0.36)
  const labels = THREE.MathUtils.smoothstep(progress, 0.42, 0.84)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 5.2) * 0.006
    groupRef.current.scale.set(1, pulse, 1)
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.70, 0.405]} />
        <meshBasicMaterial color="#020609" transparent opacity={0.94 * boot} />
      </mesh>

      <mesh position={[0, 0.177, 0.002]}>
        <planeGeometry args={[0.68, 0.018]} />
        <meshBasicMaterial color="#d7eefc" transparent opacity={(1 - labels) * boot * 0.48} />
      </mesh>

      {LABELS.map((label, index) => (
        <Text
          key={label.text}
          position={[0, label.y, 0.004]}
          fontSize={0.034}
          color={index === 1 ? '#f3f8ff' : '#b7cadc'}
          anchorX="center"
          anchorY="middle"
          material-transparent
          material-opacity={labels}
        >
          {label.text}
        </Text>
      ))}
    </group>
  )
}
