import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 250
const NUM_PTS = 40
const REPEL_RADIUS = 120
const REPEL_STRENGTH = 500
const HALF_LINE_W = 175
const LINE_H = 3
const CIRCLE_RADIUS = 100
const CIRCLE_ARC_SPAN = Math.PI * 0.55
const CIRCLE_SPEED = 0.0012
const WAVE_SCALE = 0.25
const SNAKE_SPEED = 0.2

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}
function getWaveDisp(pos, t) {
  const w1 = Math.sin(pos * Math.PI * 4 + t * 2.5) * 22
  const w2 = Math.sin(pos * Math.PI * 1.7 + t * 1.8) * 15.4
  const w3 = Math.sin(pos * Math.PI * 8 + t * 4.2) * 7.7
  return w1 + w2 + w3
}

export default function ParticleField({ snakePointsRef, releaseStep }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const releaseStepRef = useRef(releaseStep)
  releaseStepRef.current = releaseStep
  const fadeTimeRef = useRef(0)
  const releaseTimerRef = useRef(0)
  const domTargetYRef = useRef(null)
  const startStateRef = useRef(null)
  const snakeHeadRef = useRef(0)
  const loadTimerRef = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const W = window.innerWidth
    const H = window.innerHeight

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      pathT: i / Math.max(1, PARTICLE_COUNT - 1),
      startX: Math.random() * W,
      startY: Math.random() * H,
      offX: (Math.random() - 0.5) * 10,
      offY: (Math.random() - 0.5) * 10,
      size: 1 + Math.random() * 1.5,
      baseAlpha: 0.12 + Math.random() * 0.18,
      converge: 0,
      convergeDelay: 1 + Math.random() * 3,
      convergeRate: 0.15 + Math.random() * 0.25,
      pushX: 0,
      pushY: 0,
      cachedX: 0,
      cachedY: 0,
    }))

    const pathPts = new Array(NUM_PTS)

    function computePath(time, step, cx, cy, targetY) {
      if (step === 'loading') {
        const driftX = Math.sin(time * 0.00025) * 120 + Math.sin(time * 0.0006) * 60
        const driftY = Math.cos(time * 0.00035) * 100 + Math.sin(time * 0.0005) * 50
        const lcx = cx + driftX
        const lcy = cy + driftY
        const headAngle = time * CIRCLE_SPEED
        if (!startStateRef.current) {
          startStateRef.current = {
            startCx: lcx, startCy: lcy,
            startHeadAngle: headAngle,
            startArcSpan: CIRCLE_ARC_SPAN,
            startRadius: CIRCLE_RADIUS,
          }
        }
        for (let i = 0; i < NUM_PTS; i++) {
          const pos = i / (NUM_PTS - 1)
          const angle = headAngle - CIRCLE_ARC_SPAN + pos * CIRCLE_ARC_SPAN
          const disp = getWaveDisp(pos, time * 0.001) * WAVE_SCALE
          const r = CIRCLE_RADIUS + disp
          pathPts[i] = { x: lcx + r * Math.cos(angle), y: lcy + r * Math.sin(angle) }
        }
      } else if (step === 'releasing') {
        const rel = releaseTimerRef.current
        const ss = startStateRef.current
        if (!ss) return

        const shapeT = Math.min(1, rel / 0.30)
        const morphT = Math.max(0, Math.min(1, (rel - 0.30) / 0.20))
        const easedShape = easeInOutCubic(shapeT)
        const easedMorph = easeOutCubic(morphT)

        const arcSpan = rel < 0.30
          ? ss.startArcSpan + (Math.PI - ss.startArcSpan) * easedShape
          : Math.PI

        const centerAngle = rel < 0.30
          ? ss.startHeadAngle + (Math.PI / 2 - ss.startHeadAngle) * easedShape
          : Math.PI / 2

        const lineCx = rel < 0.30
          ? ss.startCx + (cx - ss.startCx) * easedShape
          : cx

        const lineCy = rel < 0.30
          ? ss.startCy + ((targetY - ss.startRadius) - ss.startCy) * easedShape
          : targetY - ss.startRadius

        const ampScale = 1 - easedShape

        for (let i = 0; i < NUM_PTS; i++) {
          const pos = i / (NUM_PTS - 1)
          const angle = centerAngle - arcSpan / 2 + pos * arcSpan
          const disp = getWaveDisp(pos, time * 0.001) * WAVE_SCALE * ampScale
          const r = Math.max(0, ss.startRadius + disp)
          pathPts[i] = { x: lineCx + r * Math.cos(angle), y: lineCy + r * Math.sin(angle) }
        }

        if (rel >= 0.30) {
          for (let i = 0; i < NUM_PTS; i++) {
            const pos = i / (NUM_PTS - 1)
            const arcPt = pathPts[i]
            const lx = cx - HALF_LINE_W + pos * 2 * HALF_LINE_W
            const ly = targetY
            pathPts[i] = {
              x: arcPt.x + (lx - arcPt.x) * easedMorph,
              y: arcPt.y + (ly - arcPt.y) * easedMorph,
            }
          }
        }
      }
    }

    const onMouse = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY }
    const onLeave = () => { mouseRef.current.x = -9999; mouseRef.current.y = -9999 }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onLeave)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
      domTargetYRef.current = null
    }
    resize()
    window.addEventListener('resize', resize)

    let prevTime = 0

    const draw = (time) => {
      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 0.016
      prevTime = time

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const W = window.innerWidth
      const H = window.innerHeight
      const cx = W / 2
      const cy = H / 2

      if (domTargetYRef.current === null) {
        const el = document.querySelector('.ved-underline')
        if (el) domTargetYRef.current = el.getBoundingClientRect().top + 1.5
      }
      const targetY = domTargetYRef.current ?? (H / 2 + 70)

      ctx.clearRect(0, 0, W, H)

      const step = releaseStepRef.current
      const rel = releaseTimerRef.current

      if (step === 'releasing') {
        fadeTimeRef.current += dt
        releaseTimerRef.current = Math.min(1, releaseTimerRef.current + dt * 0.18)
      } else {
        fadeTimeRef.current = 0
        releaseTimerRef.current = 0
        startStateRef.current = null
      }
      if (step === 'loading') {
        if (loadTimerRef.current < 0) loadTimerRef.current = 0
        loadTimerRef.current += dt
        snakeHeadRef.current = Math.min(1, snakeHeadRef.current + dt * SNAKE_SPEED)
      } else {
        loadTimerRef.current = -1
      }

      computePath(time, step, cx, cy, targetY)

      for (const p of particles) {
        p.convergeDelay = Math.max(0, p.convergeDelay - dt)

        let tx = 0, ty = 0
        let hasTarget = false

        if (step === 'loading' || (step === 'releasing' && rel < 0.30)) {
          const idx = p.pathT * (NUM_PTS - 1)
          const i0 = Math.floor(idx)
          const i1 = Math.min(i0 + 1, NUM_PTS - 1)
          const frac = idx - i0
          const px = pathPts[i0]?.x ?? 0
          const py = pathPts[i0]?.y ?? 0
          const qx = pathPts[i1]?.x ?? 0
          const qy = pathPts[i1]?.y ?? 0
          tx = px + (qx - px) * frac
          ty = py + (qy - py) * frac
          hasTarget = true
        }

        const inSnake = step !== 'loading' || p.pathT <= snakeHeadRef.current

        if (inSnake && hasTarget && p.convergeDelay <= 0) {
          const rate = step === 'releasing' ? p.convergeRate * 3 : p.convergeRate
          p.converge = Math.min(1, p.converge + rate * dt)
        }
        if (inSnake && hasTarget) {
          p.cachedX = p.startX + (tx - p.startX) * p.converge + p.offX
          p.cachedY = p.startY + (ty - p.startY) * p.converge + p.offY
        } else {
          p.cachedX = p.startX
          p.cachedY = p.startY
        }

        let particleFade = 1

        if (step === 'loading') {
          if (loadTimerRef.current < 1.0) {
            particleFade = 0
          } else if (p.pathT > snakeHeadRef.current) {
            particleFade = 0
          } else {
            const dist = snakeHeadRef.current - p.pathT
            particleFade = Math.min(1, dist * 5)
          }
        } else if (step === 'releasing' && rel >= 0.30) {
          particleFade = Math.max(0, 1 - (rel - 0.30) / 0.08)
        }

        const ddx = p.cachedX - mx
        const ddy = p.cachedY - my
        const dist = Math.sqrt(ddx * ddx + ddy * ddy)
        let bx = p.pushX
        let by = p.pushY
        if (mx > -9000 && dist < REPEL_RADIUS && dist > 0.5) {
          const force = (1 - dist / REPEL_RADIUS) * (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH * dt
          bx += (ddx / dist) * force
          by += (ddy / dist) * force
        }
        p.pushX = bx * 0.88
        p.pushY = by * 0.88
        const rx = p.cachedX + p.pushX
        const ry = p.cachedY + p.pushY

        if (particleFade > 0) {
          const a = p.baseAlpha * particleFade
          ctx.beginPath()
          ctx.arc(rx, ry, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(232,198,96,${a})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(rx, ry, p.size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(232,198,96,${a * 0.08})`
          ctx.fill()
        }
      }

      if (step === 'releasing' && rel >= 0.30) {
        const lineT = Math.min(1, (rel - 0.30) / 0.08)
        const lineA = easeOutCubic(lineT)

        ctx.beginPath()
        ctx.moveTo(pathPts[0].x, pathPts[0].y)
        for (let i = 1; i < NUM_PTS; i++) {
          ctx.lineTo(pathPts[i].x, pathPts[i].y)
        }
        ctx.strokeStyle = `rgba(232,198,96,${lineA})`
        ctx.lineWidth = LINE_H
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(pathPts[0].x, pathPts[0].y)
        for (let i = 1; i < NUM_PTS; i++) {
          ctx.lineTo(pathPts[i].x, pathPts[i].y)
        }
        ctx.strokeStyle = `rgba(232,198,96,${lineA * 0.08})`
        ctx.lineWidth = LINE_H + 5
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
        position: 'fixed', inset: 0, zIndex: 999999,
        pointerEvents: 'none',
      }}
    />
  )
}
