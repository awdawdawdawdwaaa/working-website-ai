import { useEffect, useRef } from 'react'
import { SNAKE_COLOR, getSnakePoints, setSharedSnakeState } from './SnakePath'
import { BODY_POINTS, SNAKE_THICKNESS } from './SnakePath'

export default function SnakeLoader() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const headAngleRef = useRef(0)
  const timeRef = useRef(0)

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
    window.addEventListener('resize', resize)

    const draw = (time) => {
      const dt = timeRef.current ? (time - timeRef.current) / 1000 : 0.016
      timeRef.current = time

      headAngleRef.current += dt * 0.55
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const points = getSnakePoints(cx, cy, headAngleRef.current, time * 0.001)

      setSharedSnakeState({
        points: points.map((p) => ({ x: p.x, y: p.y })),
        headAngle: headAngleRef.current,
        cx,
        cy,
        time: time * 0.001,
      })

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const prev = i > 0 ? points[i - 1] : null
        if (!prev) continue
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = SNAKE_COLOR
        ctx.lineWidth = SNAKE_THICKNESS
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = p.alpha
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 3,
        pointerEvents: 'none',
      }}
    />
  )
}
