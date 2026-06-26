import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playBoot, playClick, startFan } from './DevAudio'

function powerIconTexture() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.clearRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(255,245,232,0.82)'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(32, 34, 18, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(32, 15)
    ctx.lineTo(32, 36)
    ctx.stroke()
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  } catch {
    return null
  }
}

export default function DevPowerButton({
  enabled = true,
  onPowerOn,
  position = [0, 0, 0],
}) {
  const groupRef = useRef(null)
  const buttonRef = useRef(null)
  const pressRef = useRef(0)
  const doneRef = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const iconTexture = useMemo(powerIconTexture, [])

  useFrame(() => {
    pressRef.current = THREE.MathUtils.lerp(pressRef.current, pressed ? 1 : 0, 0.16)
    if (buttonRef.current) {
      buttonRef.current.position.z = -pressRef.current * 0.010
      buttonRef.current.scale.setScalar(THREE.MathUtils.lerp(buttonRef.current.scale.x, hovered ? 1.015 : 1, 0.1))
    }
  })

  const handleClick = () => {
    if (!enabled || doneRef.current) return
    doneRef.current = true
    setPressed(true)
    playClick()
    window.setTimeout(() => {
      setPressed(false)
      playBoot()
      startFan()
      onPowerOn?.()
    }, 150)
  }

  const handleOver = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handleOut = () => {
    setHovered(false)
    document.body.style.cursor = ''
  }

  return (
    <group ref={groupRef} name="PC_POWER_BUTTON" position={position}>
      <mesh name="PC_POWER_RECESSED_SOCKET" position={[0, 0, -0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.012, 32]} />
        <meshStandardMaterial color="#2b1613" roughness={0.92} metalness={0.01} />
      </mesh>
      <group ref={buttonRef}>
        <mesh
          name="PC_FLAT_RED_POWER_BUTTON"
          castShadow
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.022, 0.023, 0.012, 32]} />
          <meshStandardMaterial color={hovered ? '#c82a24' : '#ad1d19'} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh name="PC_POWER_ICON_I_IN_O" position={[0, 0, 0.0062]}>
          <planeGeometry args={[0.021, 0.021]} />
          <meshBasicMaterial map={iconTexture} transparent opacity={0.88} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
