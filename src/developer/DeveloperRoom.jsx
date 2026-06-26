import { useMemo } from 'react'
import * as THREE from 'three'
import DevDust from './DevDust'
import RetroPC from './RetroPC'
import DevCRT from './DevCRT'
import DevDeskLamp from './DevDeskLamp'
import { DevKeyboard } from './DevStageKeyboard'
import { DevMouse } from './DevStageMouse'

function woodTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#6b5b4a'; ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, w = 1 + Math.random() * 3, h = 30 + Math.random() * 200
    ctx.fillStyle = `rgba(55,40,25,${0.03 + Math.random() * 0.08})`
    ctx.fillRect(x, y, w, h)
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, r = 10 + Math.random() * 40
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(45,30,15,0.12)'); g.addColorStop(1, 'rgba(45,30,15,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t
}

function wallTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#141210'; ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256, y = Math.random() * 256
    ctx.fillStyle = `rgba(${20 + Math.random() * 10},${18 + Math.random() * 8},${16 + Math.random() * 6},${0.05 + Math.random() * 0.1})`
    ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4)
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t
}

function Table() {
  const wood = useMemo(woodTexture, [])
  return (
    <group position={[0, 0.76, 0]}>
      {/* Top */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.25, 0.04, 1.05]} />
        <meshStandardMaterial map={wood} color="#8a7a68" roughness={0.50} metalness={0.02} />
      </mesh>
      {/* Edge band */}
      <mesh position={[0, -0.022, 0]}>
        <boxGeometry args={[2.25, 0.006, 1.05]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} metalness={0.01} />
      </mesh>
      {/* Legs */}
      {[[-1.04, -0.49], [1.04, -0.49], [-1.04, 0.49], [1.04, 0.49]].map(([dx, dz], i) => (
        <group key={i} position={[dx, -0.38, dz]}>
          <mesh castShadow>
            <boxGeometry args={[0.035, 0.74, 0.035]} />
            <meshStandardMaterial color="#2c2c2a" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.045, 0.012, 0.045]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Scratches */}
      {[[-0.15, 0.01, 0.05, 0.001], [0.25, -0.01, 0.035, 0.001], [-0.35, -0.02, 0.06, 0.001]].map(([x, y, w, h], i) => (
        <mesh key={`s${i}`} position={[x, y + 0.022, 0.46]} rotation={[0, 0, (Math.random() - 0.5) * 0.3]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#5a4a3a" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  )
}

function Room() {
  const wall = useMemo(wallTexture, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#12100e" roughness={0.85} metalness={0.01} />
      </mesh>
      {[[0, 1.35, -2], [0, 1.35, 2], [-2, 1.35, 0, Math.PI / 2], [2, 1.35, 0, -Math.PI / 2]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, r || 0, 0]} receiveShadow>
          <planeGeometry args={[4, 2.7]} />
          <meshStandardMaterial map={wall} color="#141210" roughness={0.95} metalness={0.01} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.7, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.95} />
      </mesh>
    </group>
  )
}

function ContactShadowPatches() {
  return (
    <group position={[0, 0.783, 0]}>
      <mesh name="CRT_CONTACT_SHADOW" position={[0.01, 0.001, -0.110]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.36]} />
        <meshBasicMaterial color="#080706" transparent opacity={0.24} depthWrite={false} />
      </mesh>
      <mesh name="CASE_CONTACT_SHADOW" position={[0.70, 0.001, 0.010]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.54]} />
        <meshBasicMaterial color="#080706" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh name="LAMP_CONTACT_SHADOW" position={[-0.76, 0.001, 0.205]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24, 0.22]} />
        <meshBasicMaterial color="#080706" transparent opacity={0.20} depthWrite={false} />
      </mesh>
      <mesh name="KEYBOARD_CONTACT_SHADOW" position={[-0.05, 0.001, 0.330]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.96, 0.34]} />
        <meshBasicMaterial color="#080706" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh name="MOUSE_CONTACT_SHADOW_V2" position={[0.52, 0.001, 0.350]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.22, 0.18]} />
        <meshBasicMaterial color="#080706" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function DeveloperRoom({
  bootStarted,
  onBootStart,
  onBootComplete,
  bootComplete,
  dustOpacity,
  reflectionAmount,
  powered,
}) {
  return (
    <group>
      <Room />
      <Table />
      <ContactShadowPatches />
      <DevDeskLamp position={[-0.76, 0.782, 0.205]} rotation={[0, 0, 0]} />
      <DevCRT position={[0, 0.782, -0.115]} boot={bootStarted} onBootComplete={onBootComplete} bootComplete={bootComplete} reflectionAmount={reflectionAmount} />
      <DevKeyboard position={[-0.05, 0.782, 0.330]} rotation={[0.02, 0.15, 0]} />
      <DevMouse position={[0.52, 0.782, 0.350]} rotation={[0, -0.12, 0]} scale={1.12} deskY={0.78} />
      <RetroPC onPowerOn={onBootStart} powerEnabled={!bootStarted && !powered} powered={powered || bootStarted || bootComplete} />
      <DevDust active={true} opacity={dustOpacity} />
    </group>
  )
}
