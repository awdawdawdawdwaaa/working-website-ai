import { useMemo, useState } from 'react'
import * as THREE from 'three'
import DevHDDLED from './DevHDDLED'
import DevPowerButton from './DevPowerButton'
import { useLighting } from './LightingContext'

const CASE_H = 0.52
const CASE_W = 0.225
const CASE_D = 0.50
const FRONT_Z = CASE_D / 2
const FRONT_DETAIL_Z = FRONT_Z + 0.028
const BEIGE = '#d8cfbd'
const BEIGE_DARK = '#c7bba6'
const BEIGE_DEEP = '#b6a991'
const CREASE = '#51483a'

function caseTexture() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = BEIGE
    ctx.fillRect(0, 0, 256, 512)
    const yellow = ctx.createLinearGradient(0, 0, 256, 512)
    yellow.addColorStop(0, 'rgba(255,232,170,0.08)')
    yellow.addColorStop(0.55, 'rgba(180,150,90,0.06)')
    yellow.addColorStop(1, 'rgba(90,70,42,0.05)')
    ctx.fillStyle = yellow
    ctx.fillRect(0, 0, 256, 512)

    for (let i = 0; i < 4700; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 512
      const v = 175 + Math.random() * 46
      ctx.fillStyle = `rgba(${v},${v - 8},${v - 26},${0.014 + Math.random() * 0.035})`
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 4)
    }
    for (let i = 0; i < 46; i++) {
      ctx.fillStyle = `rgba(76,63,43,${0.018 + Math.random() * 0.026})`
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 12 + Math.random() * 52, 1)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1.3)
    texture.anisotropy = 4
    return texture
  } catch {
    return null
  }
}

function CaseBody() {
  const texture = useMemo(caseTexture, [])
  return (
    <group name="CASE_BODY_STACK">
      <mesh name="CASE_OUTER_TOWER" castShadow receiveShadow>
        <boxGeometry args={[CASE_W, CASE_H, CASE_D]} />
        <meshStandardMaterial map={texture} color={BEIGE} roughness={0.80} metalness={0.006} />
      </mesh>
      <mesh name="CASE_FRONT_THICK_PLASTIC" position={[0, 0, FRONT_Z + 0.012]} castShadow receiveShadow>
        <boxGeometry args={[CASE_W * 0.96, CASE_H * 0.965, 0.026]} />
        <meshStandardMaterial map={texture} color={BEIGE_DARK} roughness={0.82} metalness={0.004} />
      </mesh>
      <mesh name="CASE_INNER_SHADOW_GAP" position={[0, 0, FRONT_Z + 0.027]}>
        <boxGeometry args={[CASE_W * 0.89, CASE_H * 0.89, 0.004]} />
        <meshBasicMaterial color="#231e18" transparent opacity={0.10} />
      </mesh>
    </group>
  )
}

function DriveBays() {
  const bays = [
    { y: 0.160, h: 0.054, w: 0.162, label: '5.25' },
    { y: 0.095, h: 0.038, w: 0.148, label: '3.5' },
  ]

  return (
    <group name="CASE_DRIVE_BAYS" position={[0, 0, FRONT_DETAIL_Z]}>
      {/* 5.25" CD-ROM Drive detail */}
      <group position={[0, bays[0].y, 0]}>
        <mesh name="CASE_5.25_BAY" castShadow>
          <boxGeometry args={[bays[0].w, bays[0].h, 0.014]} />
          <meshStandardMaterial color={BEIGE_DARK} roughness={0.84} metalness={0.003} />
        </mesh>
        <mesh name="CASE_CD_TRAY" position={[0, bays[0].h * 0.15, 0.0075]}>
          <boxGeometry args={[bays[0].w * 0.85, 0.025, 0.002]} />
          <meshStandardMaterial color={BEIGE} roughness={0.7} />
        </mesh>
        <mesh name="CASE_CD_SLOT" position={[0, bays[0].h * 0.15 - 0.005, 0.008]}>
          <boxGeometry args={[bays[0].w * 0.75, 0.002, 0.001]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh name="CASE_CD_BTN" position={[bays[0].w * 0.35, -bays[0].h * 0.3, 0.008]}>
          <boxGeometry args={[0.012, 0.006, 0.002]} />
          <meshStandardMaterial color={BEIGE} roughness={0.7} />
        </mesh>
        <mesh name="CASE_5.25_BAY_LIP" position={[0, -bays[0].h * 0.45, 0.008]}>
          <boxGeometry args={[bays[0].w * 0.92, 0.004, 0.004]} />
          <meshBasicMaterial color={CREASE} transparent opacity={0.22} />
        </mesh>
      </group>

      {/* 3.5" Floppy Drive detail */}
      <group position={[0, bays[1].y, 0]}>
        <mesh name="CASE_3.5_BAY" castShadow>
          <boxGeometry args={[bays[1].w, bays[1].h, 0.014]} />
          <meshStandardMaterial color={BEIGE_DARK} roughness={0.84} metalness={0.003} />
        </mesh>
        <mesh name="CASE_FLOPPY_SLOT" position={[0, 0, 0.008]}>
          <boxGeometry args={[bays[1].w * 0.72, 0.004, 0.003]} />
          <meshBasicMaterial color="#1d1a16" transparent opacity={0.72} />
        </mesh>
        <mesh name="CASE_FLOPPY_BTN" position={[bays[1].w * 0.28, -bays[1].h * 0.25, 0.009]}>
          <boxGeometry args={[0.012, 0.008, 0.004]} />
          <meshStandardMaterial color={BEIGE} roughness={0.7} />
        </mesh>
        <mesh name="CASE_FLOPPY_LED" position={[bays[1].w * 0.15, -bays[1].h * 0.25, 0.008]}>
          <boxGeometry args={[0.004, 0.002, 0.001]} />
          <meshBasicMaterial color="#334422" />
        </mesh>
        <mesh name="CASE_3.5_BAY_LIP" position={[0, -bays[1].h * 0.45, 0.008]}>
          <boxGeometry args={[bays[1].w * 0.92, 0.004, 0.004]} />
          <meshBasicMaterial color={CREASE} transparent opacity={0.22} />
        </mesh>
      </group>
    </group>
  )
}

function FrontVents() {
  const slots = Array.from({ length: 7 }, (_, i) => i)
  return (
    <group name="CASE_FRONT_VENTS" position={[-CASE_W * 0.22, -0.030, FRONT_DETAIL_Z + 0.002]}>
      {slots.map((slot) => (
        <mesh key={slot} position={[0, -slot * 0.016, 0]}>
          <boxGeometry args={[0.080, 0.004, 0.004]} />
          <meshBasicMaterial color="#1f1b15" transparent opacity={0.62} />
        </mesh>
      ))}
    </group>
  )
}

function SideAndRearDetails() {
  const sideSlots = Array.from({ length: 10 }, (_, i) => i)
  const rearSlots = Array.from({ length: 9 }, (_, i) => i)

  return (
    <group name="CASE_SIDE_REAR_DETAILS">
      <mesh name="CASE_LEFT_PANEL_SEAM" position={[-CASE_W / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CASE_D * 0.86, CASE_H * 0.86]} />
        <meshBasicMaterial color={CREASE} transparent opacity={0.10} side={THREE.DoubleSide} />
      </mesh>
      <mesh name="CASE_RIGHT_PANEL_SEAM" position={[CASE_W / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CASE_D * 0.86, CASE_H * 0.86]} />
        <meshBasicMaterial color={CREASE} transparent opacity={0.10} side={THREE.DoubleSide} />
      </mesh>
      <group name="CASE_RIGHT_SIDE_VENTS" position={[CASE_W / 2 + 0.004, 0.060, -0.098]} rotation={[0, Math.PI / 2, 0]}>
        {sideSlots.map((slot) => (
          <mesh key={slot} position={[0, 0.050 - slot * 0.012, 0]}>
            <boxGeometry args={[0.145, 0.003, 0.004]} />
            <meshBasicMaterial color="#211d17" transparent opacity={0.58} />
          </mesh>
        ))}
      </group>
      <group name="CASE_REAR_PANEL" position={[0, 0, -CASE_D / 2 - 0.004]}>
        <mesh name="CASE_REAR_SERVICE_PLATE">
          <boxGeometry args={[CASE_W * 0.78, CASE_H * 0.72, 0.008]} />
          <meshStandardMaterial color={BEIGE_DEEP} roughness={0.86} metalness={0.02} />
        </mesh>
        <group name="CASE_REAR_VENTS" position={[0, 0.115, -0.006]}>
          {rearSlots.map((slot) => (
            <mesh key={slot} position={[-0.064 + slot * 0.016, 0, 0]}>
              <boxGeometry args={[0.006, 0.070, 0.004]} />
              <meshBasicMaterial color="#14120f" transparent opacity={0.52} />
            </mesh>
          ))}
        </group>
        <mesh name="CASE_REAR_IO_STRIP" position={[0, -0.120, -0.006]}>
          <boxGeometry args={[CASE_W * 0.62, 0.050, 0.006]} />
          <meshStandardMaterial color="#887f70" roughness={0.74} metalness={0.12} />
        </mesh>
        <mesh name="CASE_REAR_POWER_SOCKET" position={[-0.052, -0.198, -0.006]}>
          <boxGeometry args={[0.052, 0.034, 0.008]} />
          <meshStandardMaterial color="#0b0a09" roughness={0.62} metalness={0.10} />
        </mesh>
      </group>
    </group>
  )
}

function ScrewsAndWear() {
  const scratches = [
    [-0.030, 0.218, 0.052, 0.0014, 0.12],
    [0.044, 0.030, 0.034, 0.0014, 0.11],
    [-0.052, -0.150, 0.046, 0.0012, 0.14],
    [0.030, -0.203, 0.026, 0.0012, 0.12],
  ]

  return (
    <group name="CASE_SCREWS_AND_WEAR" position={[0, 0, FRONT_DETAIL_Z + 0.004]}>
      {[[-0.085, 0.235], [0.085, 0.235], [-0.085, -0.235], [0.085, -0.235]].map(([x, y], index) => (
        <mesh key={index} name="CASE_SERVICE_SCREW" position={[x, y, 0]}>
          <circleGeometry args={[0.004, 12]} />
          <meshBasicMaterial color="#716654" transparent opacity={0.58} />
        </mesh>
      ))}
      {scratches.map(([x, y, w, h, opacity], index) => (
        <mesh key={index} name="CASE_SMALL_SCRATCH" position={[x, y, 0.001]} rotation={[0, 0, (index - 1.5) * 0.06]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#776a57" transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh name="CASE_PANEL_VERTICAL_SEAM" position={[CASE_W * 0.365, 0, 0]}>
        <boxGeometry args={[0.002, CASE_H * 0.86, 0.003]} />
        <meshBasicMaterial color={CREASE} transparent opacity={0.20} />
      </mesh>
    </group>
  )
}

function PowerLed({ powered, intensity }) {
  const active = powered ? intensity : 0
  return (
    <group name="PC_SEPARATE_POWER_LED" position={[CASE_W * 0.260, -0.128, FRONT_DETAIL_Z + 0.004]}>
      <mesh name="PC_POWER_LED_DOT">
        <circleGeometry args={[0.0042, 14]} />
        <meshBasicMaterial color={powered ? '#ff3c25' : '#260704'} transparent opacity={powered ? Math.min(1, active) : 0.16} />
      </mesh>
      {powered && (
        <mesh name="PC_POWER_LED_GLOW" position={[0, 0, 0.001]}>
          <planeGeometry args={[0.018, 0.018]} />
          <meshBasicMaterial color="#ff3c25" transparent opacity={0.08 * active} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  )
}

export default function RetroPC({
  position = [0.70, 0.76 + CASE_H / 2, 0.010],
  onPowerOn,
  powerEnabled = true,
  powered = false,
}) {
  const [localPowered, setLocalPowered] = useState(powered)
  const lighting = useLighting()
  const isPowered = powered || localPowered

  const handlePowerOn = () => {
    setLocalPowered(true)
    onPowerOn?.()
  }

  return (
    <group name="PC_RETRO_BEIGE_TOWER" position={position}>
      <CaseBody />
      <DriveBays />
      <FrontVents />
      <SideAndRearDetails />
      <ScrewsAndWear />
      <DevPowerButton
        enabled={powerEnabled && !isPowered}
        onPowerOn={handlePowerOn}
        position={[CASE_W * 0.280, -0.178, FRONT_DETAIL_Z + 0.004]}
      />
      <PowerLed powered={isPowered} intensity={lighting.caseLed} />
      <DevHDDLED intensity={lighting.caseLed} position={[CASE_W * 0.140, -0.128, FRONT_DETAIL_Z + 0.004]} />
    </group>
  )
}
