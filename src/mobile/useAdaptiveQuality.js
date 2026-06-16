import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const RING_SIZE = 30
const CHECK_INTERVAL = 30
const LOW_THRESHOLD = 15
const RESTORE_THRESHOLD = 45
const LOW_CONSECUTIVE = 5
const GOOD_CONSECUTIVE = 15

export default function AdaptiveQuality() {
  const { gl } = useThree()
  const ring = useRef(new Float32Array(RING_SIZE))
  const idx = useRef(0)
  const count = useRef(0)
  const lastCheck = useRef(performance.now())
  const level = useRef(1)
  const lowCount = useRef(0)
  const goodCount = useRef(0)
  const frameCount = useRef(0)

  useFrame((state, delta) => {
    const now = performance.now()
    const dt = now - lastCheck.current
    lastCheck.current = now

    if (dt > 0 && dt < 200) {
      ring.current[idx.current] = 1000 / dt
      idx.current = (idx.current + 1) % RING_SIZE
      if (count.current < RING_SIZE) count.current++
    }

    frameCount.current++
    if (frameCount.current < CHECK_INTERVAL) return
    frameCount.current = 0

    if (count.current < 5) return

    let sum = 0
    const n = Math.min(count.current, RING_SIZE)
    for (let i = 0; i < n; i++) {
      sum += ring.current[i]
    }
    const avg = sum / n

    if (avg < LOW_THRESHOLD) {
      lowCount.current++
      goodCount.current = 0
    } else if (avg > RESTORE_THRESHOLD) {
      goodCount.current++
      lowCount.current = 0
    } else {
      lowCount.current = 0
      goodCount.current = 0
    }

    if (lowCount.current > LOW_CONSECUTIVE && level.current > 0.5) {
      level.current = Math.max(0.5, +(level.current - 0.1).toFixed(2))
      gl.setPixelRatio(Math.max(0.5, Math.min(1.25, level.current)))
      lowCount.current = 0
      if (typeof window !== 'undefined') {
        window.__MOBILE_QUALITY_LEVEL = level.current
      }
    }

    if (goodCount.current > GOOD_CONSECUTIVE && level.current < 1) {
      level.current = Math.min(1, +(level.current + 0.1).toFixed(2))
      gl.setPixelRatio(Math.max(0.5, Math.min(1.25, level.current)))
      goodCount.current = 0
      if (typeof window !== 'undefined') {
        window.__MOBILE_QUALITY_LEVEL = level.current
      }
    }
  })

  return null
}
