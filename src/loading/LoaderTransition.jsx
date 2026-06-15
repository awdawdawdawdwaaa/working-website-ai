import { useEffect, useRef } from 'react'

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function LoaderTransition({ active, onDone }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()

    const W = () => window.innerWidth
    const H = () => window.innerHeight
    const DURATION = 2200
    const R = 120
    const STROKE_W = 10
    doneRef.current = false

    const animate = (time) => {
      if (!startTimeRef.current) startTimeRef.current = time
      const elapsed = time - startTimeRef.current
      const raw = Math.min(1, elapsed / DURATION)
      const t = easeInOutCubic(raw)

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      const cx = W() / 2
      const cy = H() / 2
      const gap = Math.min(1, t / 0.25) * Math.PI * 0.7
      const startA = -Math.PI / 2 + 0.05 + gap / 2
      const endA = -Math.PI / 2 + 2 * Math.PI - 0.05 - gap / 2

      ctx.strokeStyle = '#E8C660'
      ctx.lineWidth = STROKE_W
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      if (t < 0.95) {
        // Arc portion
        ctx.arc(cx, cy, R, startA, endA)

        // Endpoint positions on the arc
        const lx = cx + R * Math.cos(endA)
        const ly = cy + R * Math.sin(endA)
        const rx = cx + R * Math.cos(startA)
        const ry = cy + R * Math.sin(startA)

        const extend = Math.max(0, Math.min(1, (t - 0.15) / 0.40))
        const converge = Math.max(0, Math.min(1, (t - 0.55) / 0.25))
        const descend = Math.max(0, Math.min(1, (t - 0.75) / 0.15))
        const fade = Math.max(0, Math.min(1, (t - 0.85) / 0.10))

        const extLen = extend * 350
        const convergeX = converge * (-cx / 2)
        const convergeY = converge * extLen * 0.5

        const targetX = cx
        const targetY = cy + R + 350 + descend * 200

        const leftEndX = lx + (targetX - lx) * converge - convergeX
        const leftEndY = ly + extLen + (targetY - (ly + extLen)) * descend
        const rightEndX = rx + (targetX - rx) * converge + convergeX
        const rightEndY = ry + extLen + (targetY - (ry + extLen)) * descend

        ctx.moveTo(lx, ly)
        ctx.lineTo(leftEndX, leftEndY)
        ctx.moveTo(rx, ry)
        ctx.lineTo(rightEndX, rightEndY)

        // If converged, draw underline at bottom
        const landT = Math.max(0, Math.min(1, (t - 0.88) / 0.07))
        if (landT > 0) {
          const underlineY = targetY
          const ulW = 180
          ctx.moveTo(cx - ulW / 2, underlineY)
          ctx.lineTo(cx + ulW / 2, underlineY)
        }

        ctx.globalAlpha = 1 - fade
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      if (raw >= 1 && !doneRef.current) {
        doneRef.current = true
        onDone?.()
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
    }
  }, [active, onDone])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  )
}
