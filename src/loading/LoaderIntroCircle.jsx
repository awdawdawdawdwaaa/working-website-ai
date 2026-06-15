import { useEffect, useRef } from 'react'

export default function LoaderIntroCircle() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = 320
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const R = 140
    const DURATION = 2200

    const draw = (time) => {
      if (!startRef.current) startRef.current = time
      const elapsed = time - startRef.current
      const t = (elapsed % DURATION) / DURATION
      const angle = t * Math.PI * 2

      ctx.clearRect(0, 0, size, size)
      ctx.beginPath()
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + angle)
      ctx.strokeStyle = '#E8C660'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
