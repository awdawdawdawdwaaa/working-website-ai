import { useEffect, useRef } from 'react'

const LINE_COUNT = 300
const LINE_LEN_MIN = 6
const LINE_LEN_MAX = 18
const WAKE_RADIUS = 250
const REPEL_RADIUS = 200
const MAX_REPEL = 2.0
const SNAKE_REPEL_RADIUS = 180
const SNAKE_MAX_REPEL = 3.5
const DRIFT_AMP = 0.2
const DIRECTION_SPEED_MIN = 0.3
const DIRECTION_SPEED_MAX = 0.8

function pseudoNoise(v) {
  return Math.sin(v * 1.17) * 0.5 + Math.sin(v * 3.71) * 0.3 + Math.sin(v * 7.31) * 0.2
}

export default function LineFieldSystem({ excludeX, excludeY, excludeRadius, snakePointsRef }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const excludeRef = useRef({ x: excludeX, y: excludeY, r: excludeRadius })
  excludeRef.current = { x: excludeX, y: excludeY, r: excludeRadius }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const onLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onLeave)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const lines = Array.from({ length: LINE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: LINE_LEN_MIN + Math.random() * (LINE_LEN_MAX - LINE_LEN_MIN),
      angle: Math.random() * Math.PI * 2,
      baseAngle: Math.random() * Math.PI * 2,
      dirSpeed: DIRECTION_SPEED_MIN + Math.random() * (DIRECTION_SPEED_MAX - DIRECTION_SPEED_MIN),
      rotSpeed: 2.0 + Math.random() * 2.0,
      phaseX: Math.random() * 100,
      phaseY: Math.random() * 100,
    }))

    let prevTime = 0

    const draw = (time) => {
      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 0.016
      prevTime = time

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const W = window.innerWidth
      const H = window.innerHeight

      ctx.clearRect(0, 0, W, H)

      for (const line of lines) {
        const dx = line.x - mx
        const dy = line.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        const exOpts = excludeRef.current
        if (exOpts.r > 0) {
          const edx = line.x - exOpts.x
          const edy = line.y - exOpts.y
          const edist = Math.sqrt(edx * edx + edy * edy)
          if (edist < exOpts.r && edist > 0.5) {
            const push = (1 - edist / exOpts.r) * (1 - edist / exOpts.r) * 3.0
            line.x += (edx / edist) * push
            line.y += (edy / edist) * push
          }
        }

        if (snakePointsRef && snakePointsRef.current.length > 0) {
          const pts = snakePointsRef.current
          let nearest = Infinity
          let nx = 0, ny = 0
          for (let j = 0; j < pts.length; j++) {
            const dx = line.x - pts[j].x
            const dy = line.y - pts[j].y
            const d = dx * dx + dy * dy
            if (d < nearest) { nearest = d; nx = dx; ny = dy }
          }
          const sdist = Math.sqrt(nearest)
          if (sdist < SNAKE_REPEL_RADIUS && sdist > 0.5) {
            const force = (1 - sdist / SNAKE_REPEL_RADIUS) * (1 - sdist / SNAKE_REPEL_RADIUS) * SNAKE_MAX_REPEL
            line.x += (nx / sdist) * force
            line.y += (ny / sdist) * force
          }
        }

        if (mx > -9000) {
          const targetAngle = Math.atan2(my - line.y, mx - line.x)
          let diff = targetAngle - line.angle
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          line.angle += diff * Math.min(1, line.rotSpeed * dt)
        }

        if (mx > -9000 && dist < WAKE_RADIUS) {
          const t = time * 0.001

          const flowX = Math.cos(line.baseAngle) * line.dirSpeed
          const flowY = Math.sin(line.baseAngle) * line.dirSpeed

          let repelX = 0
          let repelY = 0
          if (dist < REPEL_RADIUS && dist > 0.5) {
            const force = (1 - dist / REPEL_RADIUS) * (1 - dist / REPEL_RADIUS) * MAX_REPEL
            const nx = dx / dist
            const ny = dy / dist
            repelX = nx * force
            repelY = ny * force
          }

          const noiseX = pseudoNoise(t * 0.5 + line.phaseX) * DRIFT_AMP
          const noiseY = pseudoNoise(t * 0.4 + line.phaseY) * DRIFT_AMP

          line.x += flowX + repelX + noiseX
          line.y += flowY + repelY + noiseY
        }

        if (line.x < -50) line.x = W + 50
        if (line.x > W + 50) line.x = -50
        if (line.y < -50) line.y = H + 50
        if (line.y > H + 50) line.y = -50

        const halfLen = line.len / 2
        const cosA = Math.cos(line.angle)
        const sinA = Math.sin(line.angle)
        const x1 = line.x - halfLen * cosA
        const y1 = line.y - halfLen * sinA
        const x2 = line.x + halfLen * cosA
        const y2 = line.y + halfLen * sinA

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(255,255,255,${mx > -9000 ? 0.15 + Math.max(0, 1 - dist / (REPEL_RADIUS * 1.5)) * 0.35 : 0.15})`
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
