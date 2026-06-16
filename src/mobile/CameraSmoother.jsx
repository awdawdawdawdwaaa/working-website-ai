import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SHOTS = [
  { p: 0.000, pos: [0.00, 1.60, -1.20], fov: 40.5 },
  { p: 0.070, pos: [0.05, 1.60, 2.72], fov: 37.8  },
  { p: 0.130, pos: [0.50, 1.62, 1.80], fov: 45.9  },
  { p: 0.220, pos: [1.18, 1.58, 5.50], fov: 47.25 },
  { p: 0.290, pos: [0.80, 1.59, 9.50], fov: 47.25 },
  { p: 0.330, pos: [0.64, 1.60, 12.34], fov: 47.25 },
]

const CAMERA_PATH_POINTS = [
  new THREE.Vector3(0.64, 1.60, 12.34),
  new THREE.Vector3(0.00, 1.60, 15.00),
  new THREE.Vector3(-0.50, 1.58, 18.50),
  new THREE.Vector3(0.50, 1.58, 22.50),
  new THREE.Vector3(0.70, 1.56, 26.00),
  new THREE.Vector3(0.00, 1.55, 30.00),
  new THREE.Vector3(-0.40, 1.54, 33.50),
  new THREE.Vector3(0.00, 1.50, 38.00),
  new THREE.Vector3(0.30, 1.44, 42.50),
  new THREE.Vector3(0.00, 1.38, 46.00),
  new THREE.Vector3(0.00, 1.34, 47.00),
]
const CINEMATIC_PATH = new THREE.CatmullRomCurve3(CAMERA_PATH_POINTS)

function smootherstep(a, b, t) {
  if (a === b) return 1
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * x * (x * (x * 6 - 15) + 10)
}

const _vecA = new THREE.Vector3()
const _vecB = new THREE.Vector3()

export const cameraProgressRef = { current: 0 }

export default function CameraSmoother() {
  const { camera } = useThree()
  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const currentPos = useMemo(() => new THREE.Vector3(), [])
  const currentLook = useMemo(() => new THREE.Vector3(0, 1.6, 2), [])
  const initialized = useRef(false)

  useFrame((state, delta) => {
    const p = cameraProgressRef.current

    if (p < 0.330) {
      for (let i = 0; i < SHOTS.length - 1; i++) {
        const a = SHOTS[i]
        const b = SHOTS[i + 1]
        if (p >= a.p && p <= b.p) {
          const t = smootherstep(a.p, b.p, p)
          _vecA.set(a.pos[0], a.pos[1], a.pos[2])
          _vecB.set(b.pos[0], b.pos[1], b.pos[2])
          desiredPos.lerpVectors(_vecA, _vecB, t)
          lookTarget.set(0, 1.6, desiredPos.z + 1.5)
          break
        }
      }
    } else {
      const pathT = Math.max(0, Math.min(1, (p - 0.330) / 0.670))
      CINEMATIC_PATH.getPointAt(pathT, desiredPos)
      const lookAhead = Math.min(1, pathT + 0.008)
      CINEMATIC_PATH.getPointAt(lookAhead, lookTarget)
    }

    if (!initialized.current) {
      camera.position.copy(desiredPos)
      currentPos.copy(desiredPos)
      currentLook.copy(lookTarget)
      camera.lookAt(currentLook)
      camera.fov = 47.25
      camera.updateProjectionMatrix()
      initialized.current = true
      return
    }

    const dPos = 1 - Math.exp(-delta * 0.55)
    const dTgt = 1 - Math.exp(-delta * 0.6)

    currentPos.lerp(desiredPos, dPos)
    currentLook.lerp(lookTarget, dTgt)
    camera.position.copy(currentPos)
    camera.lookAt(currentLook)
  }, -1)

  return null
}
