import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 200
const ROOM_W = 3
const ROOM_D = 4
const ROOM_H = 5

export default function DevDust({ active, opacity }) {
  const ref = useRef(null)

  const geo = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * ROOM_W * 2
      pos[i * 3 + 1] = 0.5 + Math.random() * (ROOM_H - 1)
      pos[i * 3 + 2] = (Math.random() - 0.5) * ROOM_D * 2
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.001
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.userData.velocities = vel
    return g
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const mat = ref.current.material
    const target = opacity != null ? opacity : (active ? 0.25 : 0.02)
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.02)

    const pos = geo.attributes.position.array
    const vel = geo.userData.velocities
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += vel[i * 3] + Math.sin(performance.now() * 0.001 + i) * 0.0003
      pos[i * 3 + 1] += vel[i * 3 + 1] + Math.sin(performance.now() * 0.0007 + i * 2) * 0.0002
      pos[i * 3 + 2] += vel[i * 3 + 2] + Math.cos(performance.now() * 0.0005 + i) * 0.0003
      if (Math.abs(pos[i * 3]) > ROOM_W) vel[i * 3] *= -1
      if (pos[i * 3 + 1] > ROOM_H || pos[i * 3 + 1] < 0.5) vel[i * 3 + 1] *= -1
      if (Math.abs(pos[i * 3 + 2]) > ROOM_D) vel[i * 3 + 2] *= -1
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#cfc0a0" size={0.012} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
