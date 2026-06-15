import { useEffect, useRef } from 'react'

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function LoaderLineBridge({ onDone }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
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
    const DURATION = 1800
    const R = 140
    doneRef.current = false

    const draw = (time) => {
      if (!startRef.current) startRef.current = time
      const elapsed = time - startRef.current
      const raw = Math.min(1, elapsed / DURATION)
      const t = easeInOutCubic(raw)

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const targetY = window.innerHeight * 0.72
      const underlineW = 260
      const underlineH = 6

      // Phase 1: open circle at bottom (t: 0-0.35)
      const openT = Math.min(1, t / 0.35)
      const gap = openT * Math.PI * 0.8
      const startA = -Math.PI / 2 + gap / 2
      const endA = -Math.PI / 2 + 2 * Math.PI - gap / 2

      // Phase 2: extend downward (t: 0.35-0.70)
      const extendT = Math.max(0, Math.min(1, (t - 0.35) / 0.35))

      // Phase 3: converge and reach (t: 0.70-0.90)
      const convergeT = Math.max(0, Math.min(1, (t - 0.70) / 0.20))

      // Phase 4: flatten into underline (t: 0.90-1.0)
      const flattenT = Math.max(0, Math.min(1, (t - 0.90) / 0.10))

      // Arc endpoints
      const lx = cx + R * Math.cos(endA)
      const ly = cy + R * Math.sin(endA)
      const rx = cx + R * Math.cos(startA)
      const ry = cy + R * Math.sin(startA)

      ctx.strokeStyle = '#E8C660'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      // Draw arc (shrinks as gap grows)
      const arcAlpha = 1 - extendT
      if (arcAlpha > 0.01) {
        ctx.globalAlpha = arcAlpha
        ctx.arc(cx, cy, R, startA, endA)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Left and right extension lines
      const extLen = extendT * (targetY - cy + R)
      const convergeX = convergeT * (cx - lx) * 0.5
      const convergeY = convergeT * extLen * 0.1

      const leftEndX = lx - convergeX
      const leftEndY = ly + extLen - convergeY
      const rightEndX = rx + convergeX
      const rightEndY = ry + extLen - convergeY

      ctx.beginPath()
      ctx.moveTo(lx, ly)
      ctx.lineTo(leftEndX, leftEndY)
      ctx.moveTo(rx, ry)
      ctx.lineTo(rightEndX, rightEndY)
      ctx.stroke()

      // Flatten into underline
      if (flattenT > 0) {
        const bridgeY = targetY - (1 - flattenT) * (targetY - leftEndY)
        const spread = flattenT * underlineW / 2
        ctx.strokeStyle = '#E8C660'
        ctx.lineWidth = underlineH + (10 - underlineH) * (1 - flattenT)
        ctx.lineCap = 'butt'
        ctx.beginPath()
        ctx.moveTo(cx - spread, bridgeY)
        ctx.lineTo(cx + spread, bridgeY)
        ctx.stroke()
      }

      if (raw >= 1 && !doneRef.current) {
        doneRef.current = true
        onDone?.()
      } else {
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      startRef.current = null
    }
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  )
}
