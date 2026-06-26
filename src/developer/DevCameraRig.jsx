import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CENTER = new THREE.Vector3(0, 0.88, 0.10)
const A_MIN = Math.PI - 0.122  // ±7°
const A_MAX = Math.PI + 0.122
const T_MIN = 0.025             // ±2°  (slightly downward bias)
const T_MAX = 0.055
const D_MIN = 0.80              // monitor fills ~80% at closest zoom
const D_MAX = 2.50              // full desk at farthest zoom
const MOUSE_SENS = 0.003
const WHEEL_SENS = 0.004
const SMOOTH = 0.12

const FINAL_CAM = new THREE.Vector3(0.02, 0.98, -0.40)
const FINAL_LOOK = new THREE.Vector3(0, 0.92, 0.30)

export default function DevCameraRig({ autoZoom }) {
  const { camera, gl } = useThree()
  const state = useRef({ angle: Math.PI, tilt: 0.040, dist: 2.2 })
  const target = useRef({ angle: Math.PI, tilt: 0.040, dist: 2.2 })
  const zoomRef = useRef(false)
  const overrideRef = useRef(false)
  const overridePos = useRef(new THREE.Vector3())
  const overrideLook = useRef(new THREE.Vector3())
  const overrideT = useRef(0)
  const initPos = useRef(new THREE.Vector3())
  const initLook = useRef(new THREE.Vector3())

  useEffect(() => {
    const canvas = gl.domElement
    function onMouse(e) {
      if (overrideRef.current) return
      target.current.angle -= e.movementX * MOUSE_SENS
      target.current.tilt += e.movementY * MOUSE_SENS
      target.current.angle = Math.max(A_MIN, Math.min(A_MAX, target.current.angle))
      target.current.tilt = Math.max(T_MIN, Math.min(T_MAX, target.current.tilt))
    }
    function onWheel(e) {
      if (overrideRef.current) return
      target.current.dist += e.deltaY * WHEEL_SENS
      target.current.dist = Math.max(D_MIN, Math.min(D_MAX, target.current.dist))
    }
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('wheel', onWheel, { passive: true })
    return () => { canvas.removeEventListener('mousemove', onMouse); canvas.removeEventListener('wheel', onWheel) }
  }, [gl])

  useFrame((_, delta) => {
    if (autoZoom && !zoomRef.current) {
      zoomRef.current = true; overrideRef.current = true; overrideT.current = 0
      initPos.current.copy(camera.position)
      initLook.current.copy(CENTER)
      overridePos.current.copy(FINAL_CAM)
      overrideLook.current.copy(FINAL_LOOK)
    }
    if (overrideRef.current) {
      overrideT.current = Math.min(1, overrideT.current + delta * 0.40)
      const t = 1 - Math.pow(1 - overrideT.current, 3)
      camera.position.lerpVectors(initPos.current, overridePos.current, t)
      const l = new THREE.Vector3().lerpVectors(initLook.current, overrideLook.current, t)
      camera.lookAt(l)
      if (overrideT.current >= 1) {
        camera.position.copy(overridePos.current)
        camera.lookAt(overrideLook.current)
        overrideRef.current = false
      }
      return
    }
    const s = state.current, t = target.current
    const d = 1 - Math.exp(-delta * SMOOTH * 60)
    s.angle += (t.angle - s.angle) * d; s.tilt += (t.tilt - s.tilt) * d; s.dist += (t.dist - s.dist) * d
    const cd = s.dist * Math.cos(s.tilt)
    camera.position.set(CENTER.x + Math.sin(s.angle) * cd, CENTER.y + Math.sin(s.tilt) * s.dist, CENTER.z + Math.cos(s.angle) * cd)
    camera.lookAt(CENTER)
  })
  return null
}
