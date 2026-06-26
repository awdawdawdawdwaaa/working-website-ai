import { useEffect, useState } from 'react'
import * as THREE from 'three'

export default function DevHDDLED({ intensity = 1, position = [0, 0, 0] }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOn((value) => !value)
    }, 360 + Math.random() * 640)
    return () => window.clearInterval(interval)
  }, [])

  const opacity = on ? Math.min(1, 0.7 * intensity) : 0.12

  return (
    <group name="PC_HDD_LED" position={position}>
      <mesh name="PC_HDD_LED_DOT">
        <circleGeometry args={[0.0032, 12]} />
        <meshBasicMaterial color={on ? '#ff8a22' : '#1a0700'} transparent opacity={opacity} />
      </mesh>
      {on && (
        <mesh name="PC_HDD_LED_GLOW" position={[0, 0, 0.001]}>
          <planeGeometry args={[0.014, 0.014]} />
          <meshBasicMaterial
            color="#ff7a18"
            transparent
            opacity={0.07 * intensity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}
