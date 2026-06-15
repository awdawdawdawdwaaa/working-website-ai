import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { smootherstep, INFO_REVEALS } from './cinematicTimeline'
import { getLineState, getCharacterRefs, registerSlowFactor, setLineSpeedMultiplier, registerFocusedProp } from './narrativeRegistry'

// ── OLD SYSTEM SHOTS (intro + first prop only) ──────────────────────
const SHOTS = [
  { p: 0.000, pos: [0.00, 1.60, -1.20], fov: 40.5, focus: 2.2 },
  { p: 0.070, pos: [0.05, 1.60, 2.72], fov: 37.8, focus: 2.3 },
  { p: 0.130, pos: [0.50, 1.62, 1.80], fov: 45.9, focus: 3.1 },
  { p: 0.220, pos: [1.18, 1.58, 5.50], fov: 47.25, focus: 3.4 },
  { p: 0.290, pos: [0.80, 1.59, 9.50], fov: 47.25, focus: 3.4 },
  { p: 0.330, pos: [0.64, 1.60, 12.34], fov: 47.25, focus: 3.4 },
]

// ── NEW CINEMATIC CAMERA PATH (after first prop) ────────────────────
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

const MAX_COS = Math.cos(150 * Math.PI / 180)

function getPropBlend(progress) {
  for (const item of INFO_REVEALS) {
    const approachStart = item.start - 0.10
    const afterEnd = item.end + 0.04
    if (progress >= approachStart && progress <= afterEnd) {
      const range = afterEnd - approachStart
      const t = (progress - approachStart) / range
      const center = (item.start + item.end) / 2
      const peak = (center - approachStart) / range
      const width = peak * 1.6
      const dist = Math.abs(t - peak) / width
      const blend = Math.max(0, 1 - dist * dist) * 1.2
      return { blend: Math.min(1, blend), propPoint: item.propPoint }
    }
  }
  return { blend: 0, propPoint: null }
}

// Short-range variant for the new cinematic system (50% reduced focus window)
function getShortPropBlend(progress) {
  for (const item of INFO_REVEALS) {
    if (item.end <= 0.330) continue
    const approachStart = item.start - 0.03
    const afterEnd = item.end
    if (progress >= approachStart && progress <= afterEnd) {
      const range = afterEnd - approachStart
      const t = (progress - approachStart) / range
      const center = (item.start + item.end) / 2
      const peak = (center - approachStart) / range
      const width = peak * 1.6
      const dist = Math.abs(t - peak) / width
      const blend = Math.max(0, 1 - dist * dist) * 1.0
      return { blend: Math.min(1, blend), propPoint: item.propPoint }
    }
  }
  return { blend: 0, propPoint: null }
}

function vec3FromArray(values) {
  return new THREE.Vector3(values[0], values[1], values[2])
}

function findShot(progress) {
  for (let i = 0; i < SHOTS.length - 1; i++) {
    const a = SHOTS[i]
    const b = SHOTS[i + 1]
    if (progress >= a.p && progress <= b.p) {
      const t = smootherstep(a.p, b.p, progress)
      return { a, b, t }
    }
  }
  const last = SHOTS[SHOTS.length - 1]
  return { a: last, b: last, t: 1 }
}

function sampleShot(progress, outPosition) {
  const { a, b, t } = findShot(progress)
  outPosition.lerpVectors(vec3FromArray(a.pos), vec3FromArray(b.pos), t)
  const line = getLineState()
  if (line.headPoint) {
    outPosition.z = Math.min(outPosition.z, line.headPoint.z + 1.5)
  }
  return {
    fov: a.fov + (b.fov - a.fov) * t,
    focus: a.focus + (b.focus - a.focus) * t,
  }
}

export default function CameraRig({ progress }) {
  const initialized = useRef(false)
  const targetRef = useRef(new THREE.Vector3(0, 1.6, 0.24))
  const desiredPosition = useMemo(() => new THREE.Vector3(), [])
  const desiredTarget = useMemo(() => new THREE.Vector3(), [])
  const blendVec = useMemo(() => new THREE.Vector3(), [])
  const faceVec = useMemo(() => new THREE.Vector3(), [])
  const dirVec = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const camera = state.camera
    const line = getLineState()

    if (progress < 0.330) {
      // ═══════ OLD SYSTEM (intro + first prop) ═══════
      const shot = sampleShot(progress, desiredPosition)

      if (line.focusPoint) {
        desiredTarget.copy(line.focusPoint)
      }

      const introBias = 1 - smootherstep(0.070, 0.165, progress)
      if (introBias > 0) {
        const refs = getCharacterRefs()
        if (refs?.headBone) {
          refs.headBone.getWorldPosition(faceVec)
        } else {
          faceVec.set(0, 1.60, 0)
        }
        dirVec.subVectors(faceVec, camera.position)
        const dist = dirVec.length()
        if (dist > 0.001) {
          const minTargetZ = camera.position.z + MAX_COS * dist
          if (faceVec.z < minTargetZ) faceVec.z = minTargetZ
        }
        desiredTarget.lerp(faceVec, introBias)
      }

      if (introBias <= 0) {
        const { blend, propPoint } = getPropBlend(progress)
        if (blend > 0 && propPoint) {
          const propTarget = vec3FromArray(propPoint)
          propTarget.z += 0.3
          blendVec.copy(desiredTarget).lerp(propTarget, blend * 0.6)
          desiredTarget.copy(blendVec)
        }
      }

      if (introBias <= 0) {
        dirVec.subVectors(desiredTarget, camera.position)
        const tDist = dirVec.length()
        if (tDist > 0.001) {
          const minTargetZ = camera.position.z + MAX_COS * tDist
          if (desiredTarget.z < minTargetZ) desiredTarget.z = minTargetZ
        }
      }

      const dP = 1 - Math.exp(-delta * 0.55)
      const dT = 1 - Math.exp(-delta * 0.60)

      if (!initialized.current) {
        camera.position.copy(desiredPosition)
        targetRef.current.copy(desiredTarget)
        camera.fov = shot.fov
        camera.focus = shot.focus
        camera.lookAt(targetRef.current)
        camera.updateProjectionMatrix()
        initialized.current = true
        return
      }

      camera.position.lerp(desiredPosition, dP)
      targetRef.current.lerp(desiredTarget, dT)
      camera.lookAt(targetRef.current)
      camera.fov = THREE.MathUtils.lerp(camera.fov, shot.fov, 1 - Math.exp(-delta * 0.5))
      camera.focus = THREE.MathUtils.lerp(camera.focus, shot.focus, 1 - Math.exp(-delta * 0.5))
      camera.updateProjectionMatrix()
      return
    }

    // ═══════════════════════════════════════════════════════════════
    // ═══════ NEW CINEMATIC SYSTEM (after first prop) ═══════
    // ═══════════════════════════════════════════════════════════════

    // ── Position: sample smooth CatmullRom camera path ──
    const pathT = (progress - 0.330) / 0.670
    const clampedT = Math.max(0, Math.min(1, pathT))
    desiredPosition.copy(CINEMATIC_PATH.getPointAt(clampedT))

    if (line.headPoint) {
      desiredPosition.z = Math.min(desiredPosition.z, line.headPoint.z + 1.5)
    }

    // ── Proximity-based prop detection (tight timing) ──
    const NORMAL_FOCUS_RADIUS = 1.0
    const PC_FOCUS_RADIUS = 4.0
    const NORMAL_SLOW_MIN = 0.85
    const PC_SLOW_MIN = 0.10

    let minPropDist = Infinity
    let nearestProp = null
    for (const item of INFO_REVEALS) {
      if (item.end <= 0.330) continue
      const propPos = vec3FromArray(item.propPoint)
      const dist = camera.position.distanceTo(propPos)
      if (dist < minPropDist) {
        minPropDist = dist
        nearestProp = item
      }
    }

    const isPcRoom = nearestProp?.id === 'desk'
    const focusRadius = isPcRoom ? PC_FOCUS_RADIUS : NORMAL_FOCUS_RADIUS
    const slowMin = isPcRoom ? PC_SLOW_MIN : NORMAL_SLOW_MIN
    const focusMin = isPcRoom ? 1.5 : 0.5

    let sf = 1.0
    if (nearestProp && minPropDist < focusRadius) {
      const t = Math.max(0, (minPropDist - focusMin) / (focusRadius - focusMin))
      sf = slowMin + (1 - slowMin) * (t * t * (3 - 2 * t))
    }
    registerSlowFactor(sf)

    // PC room line speed: smooth 100% → 15% during room approach (0.860–0.940)
    const pcApproach = smootherstep(0.860, 0.940, progress)
    const lineSpeedMult = 1.0 - pcApproach * 0.85
    setLineSpeedMultiplier(lineSpeedMult)

    // ── Cinematic FOV for PC room entry ──
    const pcRoomFov = smootherstep(0.900, 0.970, progress)
    const targetFov = (35 + pcRoomFov * 26) * 1.35

    // ── Target: line focus point + travel direction + prop pull ──
    if (line.focusPoint) {
      desiredTarget.copy(line.focusPoint)
    }

    if (line.centerPoint && line.headPoint) {
      const travelDir = new THREE.Vector3().subVectors(line.headPoint, line.centerPoint)
      if (travelDir.lengthSq() > 0.001) {
        travelDir.normalize().multiplyScalar(0.8)
        const aheadTarget = new THREE.Vector3().copy(desiredTarget).add(travelDir)
        const fadeIn = smootherstep(0.330, 0.390, progress)
        desiredTarget.lerp(aheadTarget, 0.35 * fadeIn)
      }
    }

    const { blend, propPoint } = getShortPropBlend(progress)
    if (blend > 0 && propPoint) {
      const propTarget = vec3FromArray(propPoint)
      propTarget.z += 0.2
      desiredTarget.lerp(propTarget, blend * 0.3)
    }

    // ── Proximity prop focus (subtle) ──
    if (nearestProp && minPropDist < focusRadius) {
      const rawBlend = 1 - Math.max(0, Math.min(1,
        (minPropDist - focusMin) / (focusRadius - focusMin)
      ))
      const pullStrength = isPcRoom ? 0.15 : 0.15
      const propTarget = vec3FromArray(nearestProp.propPoint)
      propTarget.z += 0.2
      desiredTarget.lerp(propTarget, rawBlend * pullStrength)
    }

    // ── Keep within rotation limits ──
    dirVec.subVectors(desiredTarget, camera.position)
    const tDist = dirVec.length()
    if (tDist > 0.001) {
      const minTargetZ = camera.position.z + MAX_COS * tDist
      if (desiredTarget.z < minTargetZ) desiredTarget.z = minTargetZ
    }

    // ── Final PC monitor focus (overrides all at the very end) ──
    const finalFocus = smootherstep(0.970, 1.000, progress)
    if (finalFocus > 0) {
      const monitorTarget = new THREE.Vector3(0, 1.28, 47.222)
      desiredTarget.lerp(monitorTarget, finalFocus)
    }

    // ── Smooth interpolation ──
    if (!initialized.current) {
      camera.position.copy(desiredPosition)
      targetRef.current.copy(desiredTarget)
      camera.fov = targetFov
      camera.focus = 3.0
      camera.lookAt(targetRef.current)
      camera.updateProjectionMatrix()
      initialized.current = true
      return
    }

    const dPos = 1 - Math.exp(-delta * 0.6)
    const dTgt = 1 - Math.exp(-delta * 0.7)

    camera.position.lerp(desiredPosition, dPos)
    targetRef.current.lerp(desiredTarget, dTgt)
    camera.lookAt(targetRef.current)

    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 1 - Math.exp(-delta * 0.4))
    camera.focus = THREE.MathUtils.lerp(camera.focus, 3.0, 1 - Math.exp(-delta * 0.4))
    camera.updateProjectionMatrix()

    // ── ACTIVE PROP (nearest by distance) ──
    const posCheck = new THREE.Vector3()
    let closestProp = null
    let closestId = null
    let closestDist = Infinity

    for (const item of INFO_REVEALS) {
      posCheck.set(item.propPoint[0], item.propPoint[1], item.propPoint[2])
      const dist = posCheck.distanceTo(camera.position)
      if (dist < closestDist) {
        closestDist = dist
        closestProp = item
        closestId = item.id
      }
    }

    registerFocusedProp(closestProp, closestId, closestDist, 0, 0)
  })

  return null
}
