import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MonitorUI from '../ui/MonitorUI'

// ─── WORLD CONSTANTS ─────────────────────────────────────────────────────────
const CW  = 3.00   // corridor half-width (total 6 m)
const CH  = 5.00   // ceiling height
const CL  = 55     // corridor total length
const CZ0 = -4     // corridor start Z
const CZC = CZ0 + CL / 2

const WORLD = { doorZ: 42, roomZ: 43, deskZ: 47.5, chairZ: 45.0 }

const floorMat = { color: '#22201c', roughness: 0.72, metalness: 0.08 }
const wallMat  = { color: '#28241e', roughness: 0.88, metalness: 0.02 }
const ceilMat  = { color: '#1c1a16', roughness: 0.95 }
const trimMat  = { color: '#3a342c', roughness: 0.65, metalness: 0.18 }

// ─── CORRIDOR ────────────────────────────────────────────────────────────────
function Corridor() {
  return (
    <group>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, CZC]} receiveShadow>
        <planeGeometry args={[CW*2, CL]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.002, CZC]}>
        <planeGeometry args={[CW*2, CL]} />
        <meshStandardMaterial color="#1a1814" roughness={0.2} metalness={0.55} transparent opacity={0.18} />
      </mesh>
      <mesh position={[-CW, CH/2, CZC]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[CL, CH]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[CW, CH/2, CZC]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[CL, CH]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[0, CH/2, CZ0]} receiveShadow>
        <planeGeometry args={[CW*2, CH]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[0, CH, CZC]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[CW*2, CL]} />
        <meshStandardMaterial {...ceilMat} />
      </mesh>
      <mesh position={[-CW + 0.04, 0.06, CZC]}>
        <boxGeometry args={[0.08, 0.12, CL]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <mesh position={[CW - 0.04, 0.06, CZC]}>
        <boxGeometry args={[0.08, 0.12, CL]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <mesh position={[-CW + 0.04, CH - 0.06, CZC]}>
        <boxGeometry args={[0.08, 0.12, CL]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <mesh position={[CW - 0.04, CH - 0.06, CZC]}>
        <boxGeometry args={[0.08, 0.12, CL]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
    </group>
  )
}

// ─── DOOR ─────────────────────────────────────────────────────────────────────
function Door({ open }) {
  const angle = open * -1.62 // simplified door open
  const dZ = WORLD.doorZ
  return (
    <group position={[0, 0, dZ]}>
      <mesh position={[-1.38, CH/2, 0]}>
        <boxGeometry args={[CW*2 - 1.36, CH, 0.20]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[1.38, CH/2, 0]}>
        <boxGeometry args={[CW*2 - 1.36, CH, 0.20]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[0, CH - 0.60, 0]}>
        <boxGeometry args={[1.36, 1.20, 0.20]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[0, CH - 1.22, 0.01]}>
        <boxGeometry args={[1.40, 0.09, 0.24]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <mesh position={[-0.70, (CH-1.22)/2, 0.01]}>
        <boxGeometry args={[0.10, CH-1.22, 0.24]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <mesh position={[0.70, (CH-1.22)/2, 0.01]}>
        <boxGeometry args={[0.10, CH-1.22, 0.24]} />
        <meshStandardMaterial {...trimMat} />
      </mesh>
      <group position={[-0.64, 0, 0.08]} rotation={[0, angle, 0]}>
        <mesh position={[0.64, (CH-1.22)/2, 0]} castShadow>
          <boxGeometry args={[1.22, CH-1.22, 0.06]} />
          <meshStandardMaterial color="#5c4e38" roughness={0.62} metalness={0.08} />
        </mesh>
        <mesh position={[0.64, (CH-1.22)*0.65, 0.035]}>
          <boxGeometry args={[0.82, 0.60, 0.01]} />
          <meshStandardMaterial color="#4a3e2c" roughness={0.72} />
        </mesh>
        <mesh position={[0.64, (CH-1.22)*0.25, 0.035]}>
          <boxGeometry args={[0.82, 0.55, 0.01]} />
          <meshStandardMaterial color="#4a3e2c" roughness={0.72} />
        </mesh>
        <mesh position={[1.10, (CH-1.22)*0.45, 0.048]}>
          <sphereGeometry args={[0.044, 16, 16]} />
          <meshStandardMaterial color="#c8aa5a" roughness={0.22} metalness={0.82} />
        </mesh>
      </group>
    </group>
  )
}

// ─── ROOM ────────────────────────────────────────────────────────────────────
function Room() {
  const roomZ = WORLD.roomZ
  const roomDepth = 8
  const roomCenterZ = roomZ + roomDepth / 2
  return (
    <group>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, roomCenterZ]} receiveShadow>
        <planeGeometry args={[CW*2, roomDepth]} />
        <meshStandardMaterial color="#1a1814" roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[-CW, CH/2, roomCenterZ]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[roomDepth, CH]} />
        <meshStandardMaterial color="#1c1a16" roughness={0.92} metalness={0.01} />
      </mesh>
      <mesh position={[CW, CH/2, roomCenterZ]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[roomDepth, CH]} />
        <meshStandardMaterial color="#1c1a16" roughness={0.92} metalness={0.01} />
      </mesh>
      <mesh position={[0, CH/2, roomZ + roomDepth]} receiveShadow>
        <planeGeometry args={[CW*2, CH]} />
        <meshStandardMaterial color="#1c1a16" roughness={0.92} metalness={0.01} />
      </mesh>
      <mesh position={[0, CH, roomCenterZ]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[CW*2, roomDepth]} />
        <meshStandardMaterial color="#141210" roughness={0.95} />
      </mesh>
    </group>
  )
}

// ─── WORKSTATION ─────────────────────────────────────────────────────────────
// Chair and table ALWAYS remain visible — never removed.
// Monitor-only mode only affects camera/character, not furniture.
function Workstation({ screenProgress }) {
  const deskZ = WORLD.deskZ
  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, 0.76, deskZ]} castShadow receiveShadow>
        <boxGeometry args={[1.80, 0.06, 0.96]} />
        <meshStandardMaterial color="#4e4232" roughness={0.52} metalness={0.04} />
      </mesh>
      {/* Desk legs */}
      {[[-0.86,-0.34],[0.86,-0.34],[-0.86,0.34],[0.86,0.34]].map(([dx,dz],i) => (
        <mesh key={i} position={[dx, 0.38, deskZ+dz]} castShadow>
          <boxGeometry args={[0.058, 0.76, 0.058]} />
          <meshStandardMaterial color="#2c2c2a" roughness={0.55} metalness={0.38} />
        </mesh>
      ))}

      {/* Monitor — always visible, screen faces -Z toward character */}
      <group position={[0, 1.28, deskZ - 0.24]}>
        <mesh castShadow>
          <boxGeometry args={[0.94, 0.58, 0.062]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.40} metalness={0.26} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, -0.033]}>
          <planeGeometry args={[0.80, 0.46]} />
          <meshStandardMaterial
            color="#02060a"
            emissive="#0e1e30"
            emissiveIntensity={screenProgress * 0.95}
            roughness={0.04}
          />
        </mesh>
        <group position={[0, 0, -0.036]}>
          <MonitorUI progress={screenProgress} />
        </group>
        {/* Monitor stand */}
        <mesh position={[0, -0.44, 0.01]}>
          <cylinderGeometry args={[0.028, 0.028, 0.36, 12]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.44} metalness={0.58} />
        </mesh>
        <mesh position={[0, -0.64, 0.02]}>
          <boxGeometry args={[0.34, 0.034, 0.24]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.44} metalness={0.58} />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[0.06, 0.792, deskZ - 0.30]} castShadow>
        <boxGeometry args={[0.60, 0.026, 0.20]} />
        <meshStandardMaterial color="#2c2c2a" roughness={0.88} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.58, 0.798, deskZ - 0.26]} castShadow rotation={[0.08,0,0]}>
        <capsuleGeometry args={[0.036, 0.072, 5, 12]} />
        <meshStandardMaterial color="#2c2c2a" roughness={0.82} />
      </mesh>

      {/* PC tower */}
      <group position={[0.84, 0.45, deskZ + 0.14]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.82, 0.54]} />
          <meshStandardMaterial color="#1c1e20" roughness={0.52} metalness={0.20} />
        </mesh>
        <mesh position={[0, 0.06, -0.272]}>
          <planeGeometry args={[0.26, 0.44]} />
          <meshStandardMaterial
            color="#020304"
            emissive="#102236"
            emissiveIntensity={screenProgress * 0.30 + 0.08}
            roughness={0.36}
            metalness={0.38}
          />
        </mesh>
      </group>
    </group>
  )
}

// ─── CHAIR — always visible ──────────────────────────────────────────────────
function Chair() {
  const cZ = WORLD.chairZ
  return (
    <group position={[0.08, 0, cZ]}>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.60, 0.08, 0.54]} />
        <meshStandardMaterial color="#3c4040" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.86, -0.24]} rotation={[0.06,0,0]} castShadow>
        <boxGeometry args={[0.58, 0.68, 0.07]} />
        <meshStandardMaterial color="#363a3a" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.42, 12]} />
        <meshStandardMaterial color="#2c3030" roughness={0.44} metalness={0.48} />
      </mesh>
      <mesh position={[0, 0.022, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.026, 5]} />
        <meshStandardMaterial color="#262a2a" roughness={0.48} metalness={0.44} />
      </mesh>
    </group>
  )
}

// ─── VED PROLOGUE PLAQUE ──────────────────────────────────────────────────────
// Removed — was causing visual distraction at start

// ─── LAMP — moved to FAR RIGHT of desk so it never blocks monitor ─────────────
// Monitor is at X=0 (center). Lamp at X=+0.78 (right edge), angled outward.
// Final camera at [0, 1.34, 46.6] looking at [0, 1.28, 47.30] has clear line to monitor.
function Lamp() {
  return (
    <group position={[0.78, 0.79, WORLD.deskZ + 0.10]}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.10, 0.12, 0.036, 16]} />
        <meshStandardMaterial color="#3c3630" roughness={0.36} metalness={0.60} />
      </mesh>
      {/* Arm — angled outward (away from monitor) */}
      <mesh position={[0.06, 0.32, 0.02]} rotation={[0.45, 0.3, -0.2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.60, 10]} />
        <meshStandardMaterial color="#4c4232" roughness={0.34} metalness={0.62} />
      </mesh>
      {/* Shade */}
      <mesh position={[0.16, 0.58, 0.06]} rotation={[1.1, 0.3, -0.2]}>
        <coneGeometry args={[0.15, 0.19, 18, 1, true]} />
        <meshStandardMaterial color="#4c4232" roughness={0.42} metalness={0.48} side={THREE.DoubleSide} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0.16, 0.52, 0.04]}>
        <sphereGeometry args={[0.032, 14, 14]} />
        <meshStandardMaterial
          color="#ffe090"
          roughness={0.28}
          emissive="#ffe090"
          emissiveIntensity={1.8}
        />
      </mesh>
    </group>
  )
}

// ─── DUST ────────────────────────────────────────────────────────────────────
function Dust({ visible }) {
  const ref = useRef(null)
  const geo = useMemo(() => {
    const pos = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      pos[i*3]   = (Math.random() - 0.5) * (CW * 2 - 0.4)
      pos[i*3+1] = 0.3 + Math.random() * (CH - 0.6)
      pos[i*3+2] = CZ0 + Math.random() * CL
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame(() => {
    if (!ref.current) return
    ref.current.material.opacity = THREE.MathUtils.lerp(
      ref.current.material.opacity,
      visible ? 0.18 : 0.02,
      0.025
    )
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#cfc0a0" size={0.014} transparent opacity={0.02} depthWrite={false} />
    </points>
  )
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
export default function WorldGeometry({ progress }) {
  // Simple thresholds based on progress
  const doorOpen = progress > 0.6 ? Math.min(1, (progress - 0.6) / 0.1) : 0
  const roomP    = progress > 0.7 ? Math.min(1, (progress - 0.7) / 0.1) : 0
  const monitorP = progress > 0.8 ? Math.min(1, (progress - 0.8) / 0.1) : 0

  return (
    <>
      <Corridor />
      <Room />
      <Door open={doorOpen} />
      {/* Chair and table ALWAYS visible — never removed */}
      <Chair />
      <Lamp />
      <Workstation screenProgress={monitorP} />
      <Dust visible={roomP > 0.15} />
    </>
  )
}
