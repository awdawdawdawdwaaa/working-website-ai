import { useCallback, useEffect, useRef } from 'react'
import LoaderDots from './LoaderDots'
import LoaderCircle from './LoaderCircle'
import LoaderJokes from './LoaderJokes'
import LoaderTransition from './LoaderTransition'

export default function LoaderScene({ phase, progress, onReady }) {
  const mouseRef = useRef({ x: -9999, y: -9999 })

  const onMouse = useCallback((e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
  }, [])

  const onTouch = useCallback((e) => {
    const t = e.touches[0]
    if (t) {
      mouseRef.current.x = t.clientX
      mouseRef.current.y = t.clientY
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    mouseRef.current.x = -9999
    mouseRef.current.y = -9999
  }, [])

  // Input lock
  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    window.addEventListener('keydown', prevent)
    window.addEventListener('wheel', prevent, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      window.removeEventListener('keydown', prevent)
      window.removeEventListener('wheel', prevent)
      window.removeEventListener('touchmove', prevent)
    }
  }, [])

  const morphing = phase === 'morphing'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#050505',
      }}
      onMouseMove={onMouse}
      onTouchMove={onTouch}
      onMouseLeave={onMouseLeave}
    >
      <LoaderDots mouseRef={mouseRef} />
      {!morphing && <LoaderCircle progress={progress} />}
      {!morphing && <LoaderJokes />}
      <LoaderTransition active={morphing} onDone={onReady} />
    </div>
  )
}
