import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export default function FrameScheduler({ active }) {
  const { invalidate } = useThree()
  const rafRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (active) {
      let running = true
      const tick = () => {
        if (!running) return
        invalidate()
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => { running = false }
    } else {
      intervalRef.current = setInterval(() => invalidate(), 50)
      return () => {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [active, invalidate])

  return null
}
