import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  SNAKE_COLOR, SNAKE_THICKNESS, BODY_POINTS,
  ARC_DEG, SNAKE_RADIUS, UNDERLINE_W, UNDERLINE_H,
  getCirclePoint, getSnakePoints, getExitCurve, sharedSnakeState,
} from './SnakePath'

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function SnakeExit({ onDone }) {
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

    const w = window.innerWidth
    const h = window.innerHeight
    const underlineY = h * 0.72
    const saved = sharedSnakeState
    const headPos = saved?.points?.[saved.points.length - 1] ?? { x: w / 2, y: h / 2 - SNAKE_RADIUS }

    const exitCurve = getExitCurve(headPos, underlineY, w, h)
    const exitSamples = exitCurve.getSpacedPoints(120)
    const DURATION = 2400
    doneRef.current = false

    const draw = (time) => {
      if (!startRef.current) startRef.current = time
      const elapsed = time - startRef.current
      const raw = Math.min(1, elapsed / DURATION)
      const t = easeInOutCubic(raw)

      ctx.clearRect(0, 0, w, h)

      const totalCurvePts = exitSamples.length
      const headIdx = Math.floor(t * (totalCurvePts - 1))
      const bodyLength = Math.floor(BODY_POINTS * (1 - t * 0.3))

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < bodyLength; i++) {
        const idx = headIdx - i
        if (idx < 0 || idx >= totalCurvePts - 1) continue
        const p = exitSamples[idx]
        const prev = idx > 0 ? exitSamples[idx - 1] : null
        if (!prev) continue
        const alpha = 1 - i / bodyLength
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = SNAKE_COLOR
        ctx.lineWidth = SNAKE_THICKNESS
        ctx.globalAlpha = alpha
        ctx.stroke()
      }
      ctx.globalAlpha = 1

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
