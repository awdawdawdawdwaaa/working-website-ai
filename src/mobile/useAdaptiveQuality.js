import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export default function AdaptiveQuality() {
  const { gl, camera } = useThree()
  const fpsRef = useRef([])
  const lastTime = useRef(performance.now())
  const levelRef = useRef(1)
  const badFrames = useRef(0)
  const goodFrames = useRef(0)

  useEffect(() => {
    let raf
    let disposed = false

    function tick() {
      if (disposed) return
      raf = requestAnimationFrame(tick)

      const now = performance.now()
      const dt = now - lastTime.current
      lastTime.current = now

      if (dt > 0 && dt < 200) {
        const fps = 1000 / dt
        fpsRef.current.push(fps)
        if (fpsRef.current.length > 30) fpsRef.current.shift()
      }

      if (fpsRef.current.length >= 10) {
        const avg = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length

        if (avg < 15) {
          badFrames.current++
          goodFrames.current = 0
        } else if (avg > 45) {
          goodFrames.current++
          badFrames.current = 0
        } else {
          badFrames.current = 0
          goodFrames.current = 0
        }

        if (badFrames.current > 5 && levelRef.current > 0.5) {
          levelRef.current = Math.max(0.5, levelRef.current - 0.1)
          gl.setPixelRatio(Math.max(0.5, Math.min(1, levelRef.current)))
          badFrames.current = 0
          if (typeof window !== 'undefined') {
            window.__MOBILE_QUALITY_LEVEL = levelRef.current
          }
        }

        if (goodFrames.current > 15 && levelRef.current < 1) {
          levelRef.current = Math.min(1, levelRef.current + 0.1)
          gl.setPixelRatio(Math.max(0.5, Math.min(1, levelRef.current)))
          goodFrames.current = 0
          if (typeof window !== 'undefined') {
            window.__MOBILE_QUALITY_LEVEL = levelRef.current
          }
        }
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
    }
  }, [gl, camera])

  return null
}
