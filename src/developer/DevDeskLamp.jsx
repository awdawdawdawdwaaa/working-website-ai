import { useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWarmLightColor, useLighting } from './LightingContext'

function matColor({ r, g, b }) {
  return new THREE.Color(r, g, b)
}

function transformBetween(start, end) {
  const a = new THREE.Vector3(...start)
  const b = new THREE.Vector3(...end)
  const direction = new THREE.Vector3().subVectors(b, a)
  const length = direction.length()
  const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  )

  return { midpoint, length, quaternion }
}

function BarBetween({
  start,
  end,
  width = 0.014,
  depth = 0.010,
  color = '#878983',
  roughness = 0.34,
  metalness = 0.68,
}) {
  const { midpoint, length, quaternion } = useMemo(() => transformBetween(start, end), [start, end])

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow receiveShadow>
      <boxGeometry args={[width, length, depth]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

function Cable({ points, color = '#ece8dc', radius = 0.005 }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, 32, radius, 8, false)
  }, [points, radius])

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.76} metalness={0.02} />
    </mesh>
  )
}

function Hinge({ position, radius = 0.025 }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.018, 32]} />
        <meshStandardMaterial color="#565852" roughness={0.26} metalness={0.82} />
      </mesh>
      <mesh position={[0, 0, 0.010]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.008, 24]} />
        <meshStandardMaterial color="#252622" roughness={0.36} metalness={0.80} />
      </mesh>
      <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[radius * 0.70, 0.0025, 0.004]} />
        <meshStandardMaterial color="#10110f" roughness={0.52} metalness={0.40} />
      </mesh>
    </group>
  )
}

function ToggleSwitch() {
  const { lampIntensity, update } = useLighting();
  const isOn = lampIntensity > 0;
  const switchRef = useRef(null);

  useFrame((state, delta) => {
    if (switchRef.current) {
      const targetRot = isOn ? 0.30 : -0.30;
      switchRef.current.rotation.x = THREE.MathUtils.damp(switchRef.current.rotation.x, targetRot, 25, delta);
    }
  });

  const handlePointerOver = () => document.body.style.cursor = 'pointer';
  const handlePointerOut = () => document.body.style.cursor = '';
  const handleClick = (e) => {
    e.stopPropagation();
    update('lampIntensity', isOn ? 0 : 2.35);
  };

  return (
    <group 
      name="LAMP_TOGGLE_SWITCH" 
      position={[0.050, 0.046, -0.040]} 
      rotation={[0, -0.12, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <RoundedBox args={[0.044, 0.007, 0.032]} radius={0.003} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#191a18" roughness={0.45} metalness={0.32} />
      </RoundedBox>
      <mesh ref={switchRef} position={[0, 0.010, 0]} rotation={[isOn ? 0.30 : -0.30, 0, 0]} castShadow>
        <boxGeometry args={[0.023, 0.015, 0.020]} />
        <meshStandardMaterial color="#eee5c9" roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  )
}

function BaseAssembly() {
  return (
    <group name="LAMP_RECTANGULAR_BASE">
      <RoundedBox
        name="LAMP_BLACK_RUBBER_BASE"
        args={[0.260, 0.020, 0.185]}
        radius={0.020}
        smoothness={6}
        position={[0, 0.010, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#111210" roughness={0.72} metalness={0.06} />
      </RoundedBox>
      <RoundedBox
        name="LAMP_GRAY_TOP_BASE"
        args={[0.245, 0.036, 0.170]}
        radius={0.018}
        smoothness={6}
        position={[0, 0.030, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#61635c" roughness={0.30} metalness={0.72} />
      </RoundedBox>
      <RoundedBox
        name="LAMP_TOP_PLATE"
        args={[0.125, 0.005, 0.070]}
        radius={0.008}
        smoothness={4}
        position={[-0.038, 0.052, 0.002]}
        receiveShadow
      >
        <meshStandardMaterial color="#777a72" roughness={0.34} metalness={0.64} />
      </RoundedBox>
      <ToggleSwitch />
      <mesh name="LAMP_BASE_CORD_PORT" position={[-0.132, 0.028, -0.030]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.010, 24]} />
        <meshStandardMaterial color="#151612" roughness={0.50} metalness={0.55} />
      </mesh>
    </group>
  )
}

function ArmAssembly() {
  const baseJoint = [-0.060, 0.068, -0.006]
  const elbowJoint = [-0.135, 0.270, 0.010]
  const neckJoint = [0.055, 0.420, 0.086]
  const parallelOffsets = [-0.012, 0.012]

  return (
    <group name="LAMP_DOUBLE_ARM">
      <mesh name="LAMP_BASE_BRACKET" position={baseJoint} castShadow receiveShadow>
        <boxGeometry args={[0.050, 0.030, 0.038]} />
        <meshStandardMaterial color="#4e504a" roughness={0.30} metalness={0.76} />
      </mesh>

      {parallelOffsets.map((offset) => (
        <BarBetween
          key={`lower-${offset}`}
          start={[baseJoint[0] + offset, baseJoint[1] + 0.004, baseJoint[2]]}
          end={[elbowJoint[0] + offset, elbowJoint[1] - 0.010, elbowJoint[2]]}
          width={0.012}
          depth={0.010}
        />
      ))}

      {parallelOffsets.map((offset) => (
        <BarBetween
          key={`upper-${offset}`}
          start={[elbowJoint[0] + offset, elbowJoint[1] + 0.006, elbowJoint[2]]}
          end={[neckJoint[0] + offset, neckJoint[1] - 0.012, neckJoint[2]]}
          width={0.012}
          depth={0.010}
          color="#94968e"
          roughness={0.30}
        />
      ))}

      <Hinge position={baseJoint} radius={0.022} />
      <Hinge position={elbowJoint} radius={0.026} />
      <Hinge position={neckJoint} radius={0.024} />

      <Cable
        color="#1e1f1b"
        radius={0.0035}
        points={[
          [baseJoint[0] - 0.010, baseJoint[1] + 0.012, baseJoint[2] - 0.018],
          [elbowJoint[0] - 0.018, elbowJoint[1] + 0.015, elbowJoint[2] - 0.010],
          [neckJoint[0] - 0.006, neckJoint[1] - 0.002, neckJoint[2] + 0.002],
        ]}
      />
    </group>
  )
}

function ShadeVentSlots() {
  return (
    <group name="LAMP_SHADE_VENT_SLOTS" position={[0, 0.118, 0.047]}>
      {[-0.025, -0.012, 0.001, 0.014, 0.027].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.004, 0.060, 0.003]} />
          <meshStandardMaterial color="#181916" roughness={0.64} metalness={0.12} />
        </mesh>
      ))}
    </group>
  )
}

const BULB_Y = -0.038
const BULB_R = 0.015
const BEAM_H = 0.140 + BULB_Y
const BEAM_MY = BULB_Y - BEAM_H / 2

function ShadeAssembly({ warm, lampIntensity }) {
  const targetObj = useMemo(() => new THREE.Object3D(), []);

  return (
    <group name="LAMP_SHADE_ASSEMBLY" position={[0.115, 0.410, 0.145]} rotation={[-1.0, 0.85, -0.3]}>
      <mesh name="LAMP_NECK_COLLAR" position={[0, 0.108, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.044, 0.052, 0.095, 36]} />
        <meshStandardMaterial color="#5f625b" roughness={0.28} metalness={0.78} />
      </mesh>
      <ShadeVentSlots />
      <mesh name="LAMP_SHADE_OUTER" castShadow receiveShadow>
        <coneGeometry args={[0.132, 0.168, 64, 1, true]} />
        <meshStandardMaterial color="#62655e" roughness={0.24} metalness={0.78} side={THREE.DoubleSide} />
      </mesh>

      <mesh name="LAMP_SHADE_INNER" position={[0, -0.020, 0]}>
        <coneGeometry args={[0.104, 0.120, 64, 1, true]} />
        <meshStandardMaterial
          color="#d4c6a3"
          roughness={1.0}
          metalness={0}
          side={THREE.BackSide}
          emissive={warm}
          emissiveIntensity={lampIntensity > 0 ? 0.12 + lampIntensity * 0.04 : 0}
        />
      </mesh>

      <mesh name="LAMP_BULB" position={[0, BULB_Y, 0]}>
        <sphereGeometry args={[BULB_R, 16, 16]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.15} metalness={0} />
      </mesh>

      {lampIntensity > 0 && (
        <mesh name="LAMP_BEAM" position={[0, BEAM_MY, 0]}>
          <cylinderGeometry args={[0.014, 0.100, BEAM_H, 32, 1, true]} />
          <meshStandardMaterial
            color={warm}
            transparent
            opacity={0.035 * lampIntensity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      <primitive object={targetObj} position={[0, -1, 0]} />

      {lampIntensity > 0 && (
        <spotLight
          position={[0, BULB_Y, 0]}
          target={targetObj}
          angle={0.40}
          penumbra={0.65}
          intensity={lampIntensity * 2.5}
          color={warm}
          castShadow
          shadow-bias={-0.0001}
          distance={2.5}
          decay={2}
        />
      )}
    </group>
  )
}

export default function DevDeskLamp({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const lighting = useLighting()
  const warm = useMemo(() => matColor(getWarmLightColor(lighting.lampWarmth)), [lighting.lampWarmth])

  return (
    <group name="DEV_GRAY_HINGED_TASK_LAMP" position={position} rotation={rotation} scale={scale}>
      <BaseAssembly />
      <ArmAssembly />
      <ShadeAssembly warm={warm} lampIntensity={lighting.lampIntensity} />

      <Cable
        points={[
          [-0.128, 0.026, -0.030],
          [-0.185, 0.020, -0.050],
          [-0.255, 0.016, -0.050],
          [-0.350, 0.013, -0.028],
        ]}
      />
    </group>
  )
}
