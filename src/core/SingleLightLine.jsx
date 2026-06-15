import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { smootherstep, smoothstep, getCharacterTravel } from './cinematicTimeline'
import { registerLineState, getLineSpeedMultiplier } from './narrativeRegistry'

const LINE_COLOR = '#ffcc66'
const LINE_RADIUS = 0.0045
const SCREEN_Z = 47.222

function v(x, y, z) {
  return new THREE.Vector3(x, y, z)
}

function addOrganic(points, from, to, count = 7) {
  for (let i = 0; i <= count; i++) {
    const t = i / count
    points.push(v(
      THREE.MathUtils.lerp(from.x, to.x, t) + Math.sin(t * Math.PI * 2.0) * 0.08,
      THREE.MathUtils.lerp(from.y, to.y, t) + Math.sin(t * Math.PI) * 0.10,
      THREE.MathUtils.lerp(from.z, to.z, t)
    ))
  }
}

function addCircle(points, center, radiusX, radiusY, count = 28) {
  for (let i = 0; i <= count; i++) {
    const a = (i / count) * Math.PI * 2
    points.push(v(
      center.x + Math.cos(a) * radiusX,
      center.y + Math.sin(a) * radiusY,
      center.z
    ))
  }
}

const WALL_OFFSET = 0.04

function addArtisticHighlight(points, x, centerY, centerZ, halfY, halfZ) {
  const y0 = centerY - halfY
  const y1 = centerY + halfY
  const z0 = centerZ - halfZ
  const z1 = centerZ + halfZ
  const ox = x > 0 ? x - WALL_OFFSET : x + WALL_OFFSET
  const gap = 0.09

  points.push(v(ox, y0, z0))
  points.push(v(ox, y0 - gap, centerZ))
  points.push(v(ox, y0, z1))
  points.push(v(ox, centerY - halfY * 0.35, z1 + gap))
  points.push(v(ox, centerY + halfY * 0.35, z1 + gap))
  points.push(v(ox, y1, z1))
  points.push(v(ox, y1 + gap, centerZ))
  points.push(v(ox, y1, z0))
  points.push(v(ox, centerY + halfY * 0.35, z0 - gap))
  points.push(v(ox, centerY - halfY * 0.35, z0 - gap))
  points.push(v(ox, y0, z0))
}

function buildWorldSamples() {
  const points = [v(0, 1.08, 0.8)]

  addOrganic(points, v(0, 1.08, 0.8), v(2.96, 1.38, 6.0), 9)
  addArtisticHighlight(points, 3.00, 1.55, 8.0, 1.00, 1.54)

  addOrganic(points, v(2.96, 1.35, 9.8), v(-2.96, 1.46, 13.8), 11)
  addArtisticHighlight(points, -3.00, 1.55, 16.0, 0.98, 1.65)

  addOrganic(points, v(-2.96, 1.42, 18.0), v(2.96, 1.46, 21.8), 11)
  addArtisticHighlight(points, 3.00, 1.55, 24.0, 0.94, 1.48)

  addOrganic(points, v(2.96, 1.38, 26.0), v(-2.96, 1.46, 29.8), 11)
  addArtisticHighlight(points, -3.00, 1.55, 32.0, 1.06, 1.65)

  addOrganic(points, v(-2.96, 1.42, 34.0), v(2.96, 1.42, 36.4), 9)
  addArtisticHighlight(points, 3.00, 1.50, 38.0, 0.92, 1.51)

  addOrganic(points, v(3.00, 1.18, 39.0), v(0.00, 1.04, 42.1), 8)
  addOrganic(points, v(0.00, 1.04, 42.1), v(0.15, 0.76, 45.0), 9)

  addCircle(points, v(0.08, 0.54, 45.02), 0.40, 0.14, 28)

  addOrganic(points, v(0.08, 0.72, 45.1), v(-0.80, 0.82, 47.08), 6)
  points.push(v(-0.86, 0.82, 47.02))
  points.push(v(-0.86, 0.82, 47.92))
  points.push(v(0.88, 0.82, 47.92))
  points.push(v(0.88, 0.82, 47.02))
  points.push(v(-0.86, 0.82, 47.02))

  addOrganic(points, v(0.70, 0.92, 47.0), v(0.00, 1.28, SCREEN_Z), 9)

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.38)
  return curve.getSpacedPoints(1400)
}

function buildMonitorPoints(progress) {
  const draw = smoothstep(0.925, 1.0, progress)
  const path = [
    v(0.00, 1.28, 47.08),
    v(-0.30, 1.36, SCREEN_Z),
    v(0.30, 1.36, SCREEN_Z),
    v(0.30, 1.22, SCREEN_Z),
    v(-0.30, 1.22, SCREEN_Z),
    v(-0.30, 1.10, SCREEN_Z),
    v(0.30, 1.10, SCREEN_Z),
  ]

  const curve = new THREE.CatmullRomCurve3(path, false, 'catmullrom', 0.14)
  const samples = curve.getSpacedPoints(200)
  const head = Math.max(1, Math.floor(draw * (samples.length - 1)))
  const tail = Math.max(0, head - 140)
  return samples.slice(tail, head + 1)
}

function buildIntroPoints(camera, progress) {
  const leave = smoothstep(0.085, 0.128, progress)
  const count = 16
  const points = []

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const x = THREE.MathUtils.lerp(-0.18, 0.18, t)
    const y = -0.24 + Math.sin(t * Math.PI * 2) * 0.005
    const ndc = new THREE.Vector3(x, y, 0.5).unproject(camera)
    const world = camera.position.clone().add(ndc.sub(camera.position).normalize().multiplyScalar(2.2))
    points.push(world)
  }

  const transX = 0.20 + leave * 0.08
  const transY = -0.28 - leave * 0.04
  const ndc = new THREE.Vector3(transX, transY, 0.5).unproject(camera)
  const world = camera.position.clone().add(ndc.sub(camera.position).normalize().multiplyScalar(2.3))
  points.push(world)
  points.push(v(0.24, 1.10, 0.85 + leave * 0.30))
  points.push(v(0.0, 1.08, 0.8))

  return points
}

function buildOrbitPoints(camera, effProgress) {
  const orbitT = Math.min(1, Math.max(0, (effProgress - 0.080) / 0.100))
  const angle = orbitT * Math.PI * 2
  const arcSpan = Math.PI * 0.6
  const startAngle = angle - arcSpan
  const headPos = getCharacterTravel(effProgress)
  const r = 0.4

  const count = 14
  const pts = []

  // Fly from underline screen position to orbit (0.080-0.100)
  const flyT = Math.min(1, Math.max(0, (effProgress - 0.080) / 0.020))
  const ndc = new THREE.Vector3(0, -0.72, 0.5).unproject(camera)
  const screenPos = camera.position.clone().add(
    ndc.sub(camera.position).normalize().multiplyScalar(2.8)
  )

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const a = startAngle + t * arcSpan
    const ox = Math.cos(a) * r
    const oz = headPos.z + 0.20 + Math.sin(a) * r
    const oy = 1.54 + Math.sin(a * 2) * 0.02

    if (effProgress < 0.100) {
      pts.push(v(
        screenPos.x + (ox - screenPos.x) * flyT,
        screenPos.y - 0.08 + (oy - screenPos.y + 0.08) * flyT,
        screenPos.z + (oz - screenPos.z) * flyT
      ))
    } else {
      pts.push(v(ox, oy, oz))
    }
  }

  return pts
}

function buildTransitionToWorld(orbitPoints) {
  const mid = orbitPoints.length > 0 ? orbitPoints[orbitPoints.length - 1] : v(0, 1.08, 0.8)
  const start = v(0, 1.08, 0.8)
  const count = 6
  const pts = []
  for (let i = 0; i <= count; i++) {
    const t = i / count
    pts.push(v(
      THREE.MathUtils.lerp(mid.x, start.x, t),
      THREE.MathUtils.lerp(mid.y, start.y, t),
      THREE.MathUtils.lerp(mid.z, start.z, t)
    ))
  }
  return pts
}

// Linear travel for constant speed along the path
function linearTravel(progress, t0, t1) {
  return Math.max(0, Math.min(1, (progress - t0) / (t1 - t0)))
}

function getWorldSegment(samples, progress) {
  const travel = linearTravel(progress, 0.120, 0.985)
  const head = Math.max(1, Math.floor(travel * (samples.length - 1)))
  const tail = Math.max(0, head - 130)
  const points = samples.slice(tail, head + 1)
  return points.length > 1 ? points : [samples[0], samples[1]]
}

function makeTubeGeometry(points) {
  const clean = points.length > 1 ? points : [v(0, 0, 0), v(0.01, 0, 0)]
  const curve = new THREE.CatmullRomCurve3(clean, false, 'catmullrom', 0.35)
  return new THREE.TubeGeometry(curve, Math.max(8, clean.length * 4), LINE_RADIUS, 6, false)
}

export default function SingleLightLine({ progress, loaderLineActive = false }) {
  const meshRef = useRef(null)
  const lightRef = useRef(null)
  const mainMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: LINE_COLOR,
    transparent: true,
    opacity: 0.40,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }), [])
  const worldSamples = useMemo(buildWorldSamples, [])
  const initialGeometry = useMemo(() => makeTubeGeometry([v(-0.1, 1, 0), v(0.1, 1, 0)]), [])
  const lineEffRef = useRef(progress)
  const prevProgressRef = useRef(progress)
  const fadeRef = useRef(null)
  const gateActiveRef = useRef(false)

  useEffect(() => {
    return () => { mainMaterial.dispose() }
  }, [mainMaterial])

  useEffect(() => {
    if (loaderLineActive) {
      mainMaterial.opacity = 0
      gateActiveRef.current = true
    }
  }, [])

  useFrame(({ camera, clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const rawDelta = progress - prevProgressRef.current
    prevProgressRef.current = progress
    const lineSpeedMult = getLineSpeedMultiplier()
    if (rawDelta > 0) {
      lineEffRef.current += rawDelta * lineSpeedMult
    } else {
      lineEffRef.current += rawDelta
    }
    lineEffRef.current = Math.min(lineEffRef.current, progress)
    lineEffRef.current = Math.max(0, lineEffRef.current)

    const effProgress = lineEffRef.current

    let points

    if (effProgress < 0.080) {
      const intro = buildIntroPoints(camera, Math.min(effProgress, 0.128))
      const travel = linearTravel(effProgress, 0.120, 0.985)
      const head = Math.max(1, Math.floor(travel * (worldSamples.length - 1)))
      const world = worldSamples.slice(0, head + 1)
      points = [...intro, ...world]
    } else if (effProgress < 0.200) {
      const orbit = buildOrbitPoints(camera, effProgress)
      const blendT = Math.min(1, Math.max(0, (effProgress - 0.180) / 0.020))
      if (blendT > 0) {
        const bridge = buildTransitionToWorld(orbit)
        points = [...orbit, ...bridge]
      } else {
        points = orbit
      }
    } else if (effProgress > 0.940) {
      const travel = linearTravel(Math.min(effProgress, 0.985), 0.120, 0.985)
      const head = Math.max(1, Math.floor(travel * (worldSamples.length - 1)))
      const tail = Math.max(0, head - 130)
      const world = worldSamples.slice(tail, head + 1)
      const monitor = buildMonitorPoints(effProgress)
      points = [...world, ...monitor]
    } else {
      points = getWorldSegment(worldSamples, effProgress)
    }

    if (points.length < 2) {
      points = [v(0, 0, 0), v(0.01, 0, 0)]
    }

    const geometry = makeTubeGeometry(points)
    mesh.geometry.dispose()
    mesh.geometry = geometry

    const head = points[points.length - 1]
    if (lightRef.current && head) {
      lightRef.current.position.copy(head)
      lightRef.current.intensity = 0.30 + Math.sin(performance.now() * 0.008) * 0.04
    }

    // Publish line state for camera targeting
    const mid = points[Math.floor(points.length / 2)]
    const focusIdx = Math.floor(points.length * 0.6)
    const focusPoint = points[Math.min(focusIdx, points.length - 1)]
    if (mid && focusPoint) {
      registerLineState({ centerPoint: mid, focusPoint, headPoint: head, count: points.length })
    }

    // Opacity — loader handoff fades in, then progress gate takes over
    if (loaderLineActive) {
      mainMaterial.opacity = 0
      fadeRef.current = null
      gateActiveRef.current = true
    } else if (gateActiveRef.current) {
      if (fadeRef.current === null) fadeRef.current = clock.elapsedTime - 0.050
      const elapsed = clock.elapsedTime - fadeRef.current
      const t = Math.min(1, Math.max(0.030, elapsed / 0.8))
      const eased = 1 - (1 - t) * (1 - t)
      mainMaterial.opacity = eased * 0.40

      if (t >= 1) {
        gateActiveRef.current = false
      }
    } else if (progress < 0.080) {
      mainMaterial.opacity = 0
    } else if (progress < 0.090) {
      mainMaterial.opacity = 0.40 * (progress - 0.080) / 0.010
    } else {
      mainMaterial.opacity = 0.40
    }
  })

  return (
    <>
      <mesh ref={meshRef} geometry={initialGeometry} material={mainMaterial} frustumCulled={false} />
      <pointLight ref={lightRef} color={LINE_COLOR} intensity={0.8} distance={2.0} decay={2.5} />
    </>
  )
}
