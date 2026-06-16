import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export default function WarmupPhase() {
  const { gl, scene, camera } = useThree()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    console.log('%c[Warmup] Starting shader compile...', 'color:#8a7d6a')

    const t0 = performance.now()

    gl.compile(scene, camera)

    for (let i = 0; i < 3; i++) {
      gl.render(scene, camera)
    }

    const elapsed = performance.now() - t0
    console.log(
      `%c[Warmup] Compile + 3 warmup frames: ${elapsed.toFixed(0)}ms`,
      'color:#8a7d6a'
    )

    if (typeof window !== 'undefined') {
      window.__MOBILE_WARMUP_DONE = true
      window.__MOBILE_WARMUP_MS = elapsed
    }
  }, [gl, scene, camera])

  return null
}
