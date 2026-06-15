import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { smootherstep } from '../cinematicTimeline'
import { registerLineState } from '../narrativeRegistry'
import { getRoomSamples } from './PcRoomPath'
import { getRoomLineOpacity } from './PcRoomTrigger'

const LINE_COLOR = '#ffcc66'
const BASE_RADIUS = 0.0045
const SAMPLE_COUNT = 320
const MONITOR_TAPER_START = 0.970
const MONITOR_TAPER_END = 0.995

function makeTubeGeometry(points, radius) {
  const clean = points.length > 1 ? points : [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.01, 0, 0)]
  const curve = new THREE.CatmullRomCurve3(clean, false, 'catmullrom', 0.35)
  return new THREE.TubeGeometry(curve, Math.max(8, clean.length * 4), radius, 6, false)
}

export default function PcRoomLine({ progress }) {
  const meshRef = useRef(null)
  const lightRef = useRef(null)
  const displayProgress = useRef(0)
  const targetProgress = useRef(0)
  const prevProgress = useRef(0)
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: LINE_COLOR,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }), [])
  const samples = useMemo(() => getRoomSamples(SAMPLE_COUNT), [])
  const initialGeometry = useMemo(() => makeTubeGeometry([
    new THREE.Vector3(-0.1, 1, 0),
    new THREE.Vector3(0.1, 1, 0),
  ], BASE_RADIUS * 1.65), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const opacity = getRoomLineOpacity(progress)

    if (opacity <= 0) {
      material.opacity = 0
      if (mesh.geometry) mesh.geometry.dispose()
      mesh.geometry = initialGeometry
      if (lightRef.current) lightRef.current.intensity = 0
      return
    }

    // ── Room speed: 45% slower when active ──
    const rawDelta = progress - prevProgress.current
    prevProgress.current = progress

    if (progress > 0.900) {
      targetProgress.current += rawDelta * 0.55
    } else {
      targetProgress.current = progress
    }

    // ── Smoothing ──
    displayProgress.current += (targetProgress.current - displayProgress.current) * 0.035

    // ── Monitor taper: stepped shrink 0.970→0.995 ──
    const monT = Math.max(0, Math.min(1,
      (progress - MONITOR_TAPER_START) / (MONITOR_TAPER_END - MONITOR_TAPER_START)
    ))

    let radiusScale
    if (monT <= 0.25) {
      radiusScale = 1.0
    } else if (monT <= 0.40) {
      radiusScale = 0.90
    } else if (monT <= 0.55) {
      radiusScale = 0.75
    } else if (monT <= 0.70) {
      radiusScale = 0.55
    } else if (monT <= 0.85) {
      radiusScale = 0.30
    } else {
      radiusScale = 0.0
    }

    const radius = Math.max(0.0001, BASE_RADIUS * 1.65 * radiusScale)

    // ── Light intensity fades as line enters monitor ──
    const lightFade = smootherstep(MONITOR_TAPER_START, 1.0, progress)
    const lightIntensity = (1.0 - lightFade) * 0.8

    // ── Sample head from smoothed display progress ──
    const effProgress = Math.max(0, Math.min(1, displayProgress.current))
    const head = Math.max(1, Math.floor(effProgress * (samples.length - 1)))
    const tail = Math.max(0, head - 100)
    const points = samples.slice(tail, head + 1)

    if (points.length < 2) {
      material.opacity = 0
      return
    }

    const geometry = makeTubeGeometry(points, radius)
    mesh.geometry.dispose()
    mesh.geometry = geometry

    material.opacity = opacity * 0.40

    const headPoint = points[points.length - 1]
    if (lightRef.current && headPoint) {
      lightRef.current.position.copy(headPoint)
      lightRef.current.intensity = lightIntensity
    }

    // Register line state for camera targeting
    const mid = points[Math.floor(points.length / 2)]
    const focusIdx = Math.floor(points.length * 0.6)
    const focusPoint = points[Math.min(focusIdx, points.length - 1)]
    if (mid && focusPoint) {
      registerLineState({ centerPoint: mid, focusPoint, headPoint, count: points.length })
    }
  })

  return (
    <>
      <mesh ref={meshRef} geometry={initialGeometry} material={material} frustumCulled={false} />
      <pointLight ref={lightRef} color={LINE_COLOR} intensity={0} distance={2.0} decay={2.5} />
    </>
  )
}
