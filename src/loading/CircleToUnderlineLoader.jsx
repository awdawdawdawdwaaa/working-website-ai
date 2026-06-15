import { useEffect, useRef } from 'react'

const NUM_POINTS = 40
const LINE_WIDTH = 4
const DISP_AMPLITUDE = 22
const MOUSE_RADIUS = 160
const MOUSE_PUSH = 18
const LINE_HEIGHT = 3
const LINE_HALF_WIDTH = 175
const TARGET_Y_OFFSET = 70
const CIRCLE_RADIUS = 100
const CIRCLE_ARC_SPAN = Math.PI * 0.55
const CIRCLE_SPEED = 0.0012
const WAVE_SCALE = 0.25

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutQuad(t) {
  return t * (2 - t)
}

function getWaveDisp(pos, t) {
  const w1 = Math.sin(pos * Math.PI * 4 + t * 2.5) * DISP_AMPLITUDE
  const w2 = Math.sin(pos * Math.PI * 1.7 + t * 1.8) * DISP_AMPLITUDE * 0.7
  const w3 = Math.sin(pos * Math.PI * 8 + t * 4.2) * DISP_AMPLITUDE * 0.35
  return w1 + w2 + w3
}

function drawUnderline(ctx, cx, cy, halfW, lineH, alpha) {
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.moveTo(cx - halfW, cy)
  ctx.lineTo(cx + halfW, cy)
  ctx.strokeStyle = '#E8C660'
  ctx.lineWidth = lineH
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx - halfW, cy)
  ctx.lineTo(cx + halfW, cy)
  ctx.strokeStyle = 'rgba(232,198,96,0.25)'
  ctx.lineWidth = lineH + 5
  ctx.stroke()
  ctx.globalAlpha = 1
}

export default function CircleToUnderlineLoader({ releaseStep, onExpansionDone, snakePointsRef }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const releaseTRef = useRef(0)
  const doneFiredRef = useRef(false)
  const releaseStepRef = useRef(releaseStep)
  releaseStepRef.current = releaseStep
  const onDoneRef = useRef(onExpansionDone)
  onDoneRef.current = onExpansionDone
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const startStateRef = useRef(null)
  const holdStartRef = useRef(null)
  const domTargetYRef = useRef(null)

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
      domTargetYRef.current = null
    }
    resize()
    window.addEventListener('resize', resize)

    let prevTime = 0

    const draw = (time) => {
      const dt = prevTime ? (time - prevTime) / 1000 : 0.016
      prevTime = time

      const step = releaseStepRef.current
      const W = window.innerWidth
      const H = window.innerHeight
      const cx = W / 2
      const cy = H / 2
      if (domTargetYRef.current === null) {
        const el = document.querySelector('.ved-underline')
        if (el) {
          domTargetYRef.current = el.getBoundingClientRect().top + 1.5
        }
      }
      const targetY = domTargetYRef.current ?? (cy + TARGET_Y_OFFSET)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const animTime = time * 0.001

      ctx.clearRect(0, 0, W, H)

      const snakePts = []

      if (step === 'loading') {
        const driftX = Math.sin(time * 0.00025) * 120 + Math.sin(time * 0.0006) * 60
        const driftY = Math.cos(time * 0.00035) * 100 + Math.sin(time * 0.0005) * 50
        const lineCx = cx + driftX
        const lineCy = cy + driftY
        const headAngle = time * CIRCLE_SPEED
        const arcSpan = CIRCLE_ARC_SPAN

        for (let i = 0; i < NUM_POINTS; i++) {
          const pos = i / (NUM_POINTS - 1)
          const angle = headAngle - arcSpan + pos * arcSpan
          const disp = getWaveDisp(pos, animTime) * WAVE_SCALE
          const radius = CIRCLE_RADIUS + disp

          let px = lineCx + radius * Math.cos(angle)
          let py = lineCy + radius * Math.sin(angle)

          const dx = px - mx
          const dy = py - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS && dist > 0 && mx > -9000) {
            const falloff = 1 - dist / MOUSE_RADIUS
            const push = falloff * falloff * MOUSE_PUSH
            const nx = dx / dist
            const ny = dy / dist
            px += nx * push
            py += ny * push
          }

          snakePts.push({ x: px, y: py })

          if (i === 0) { ctx.beginPath(); ctx.moveTo(px, py) }
          else { ctx.lineTo(px, py) }
        }

        ctx.strokeStyle = '#E8C660'
        ctx.lineWidth = LINE_WIDTH
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        const g = ctx.createRadialGradient(lineCx, lineCy, 1, lineCx, lineCy, 80)
        g.addColorStop(0, 'rgba(255,210,130,0.04)')
        g.addColorStop(1, 'rgba(255,210,130,0)')
        ctx.fillStyle = g
        ctx.fillRect(lineCx - 80, lineCy - 80, 160, 160)
      } else if (step === 'releasing') {
        if (!startStateRef.current) {
          const driftX = Math.sin(time * 0.00025) * 120 + Math.sin(time * 0.0006) * 60
          const driftY = Math.cos(time * 0.00035) * 100 + Math.sin(time * 0.0005) * 50
          startStateRef.current = {
            startCx: cx + driftX,
            startCy: cy + driftY,
            startHeadAngle: time * CIRCLE_SPEED,
            startArcSpan: CIRCLE_ARC_SPAN,
            startRadius: CIRCLE_RADIUS,
          }
          holdStartRef.current = null
        }

        releaseTRef.current = Math.min(1, releaseTRef.current + dt * 0.18)
        const progress = releaseTRef.current
        const ss = startStateRef.current

        if (progress < 1) {
          const shapeT = Math.min(1, progress / 0.30)
          const collapseT = Math.max(0, Math.min(1, (progress - 0.30) / 0.20))
          const easedShape = easeInOutCubic(shapeT)
          const easedCollapse = easeOutCubic(collapseT)

          const targetArcSpan = Math.PI
          const targetCenterAngle = Math.PI / 2

          const arcSpan = progress < 0.30
            ? ss.startArcSpan + (targetArcSpan - ss.startArcSpan) * easedShape
            : targetArcSpan * (1 - easedCollapse)

          const centerAngle = progress < 0.30
            ? ss.startHeadAngle + (targetCenterAngle - ss.startHeadAngle) * easedShape
            : targetCenterAngle

          const lineCx = progress < 0.30
            ? ss.startCx + (cx - ss.startCx) * easedShape
            : cx

          const currentRadius = progress < 0.30
            ? ss.startRadius
            : ss.startRadius * (1 - easedCollapse)

          const lineCy = progress < 0.30
            ? ss.startCy + ((targetY - ss.startRadius) - ss.startCy) * easedShape
            : targetY - currentRadius

          const ampScale = 1 - easedShape

          const phase3T = Math.min(1, Math.max(0, (progress - 0.40) / 0.60))
          const eased3 = easeOutQuad(phase3T)
          const halfW = LINE_HALF_WIDTH * eased3

          if (arcSpan > 0.02 && currentRadius > 1) {
            const currentLineWidth = arcSpan < 0.1 ? LINE_WIDTH * (arcSpan / 0.1) : LINE_WIDTH
            for (let i = 0; i < NUM_POINTS; i++) {
              const pos = i / (NUM_POINTS - 1)
              const angle = centerAngle - arcSpan / 2 + pos * arcSpan
              const disp = getWaveDisp(pos, animTime) * WAVE_SCALE * ampScale
              const r = Math.max(0, currentRadius + disp)
              let px = lineCx + r * Math.cos(angle)
              let py = lineCy + r * Math.sin(angle)

              const dx = px - mx
              const dy = py - my
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < MOUSE_RADIUS && dist > 0 && mx > -9000) {
                const falloff = 1 - dist / MOUSE_RADIUS
                const push = falloff * falloff * MOUSE_PUSH
                const nx = dx / dist
                const ny = dy / dist
                px += nx * push
                py += ny * push
              }

              snakePts.push({ x: px, y: py })

              if (i === 0) { ctx.beginPath(); ctx.moveTo(px, py) }
              else { ctx.lineTo(px, py) }
            }
            ctx.strokeStyle = '#E8C660'
            ctx.lineWidth = currentLineWidth
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.stroke()

            const glowR = Math.max(40 * (1 - easedShape), 8)
            const g = ctx.createRadialGradient(lineCx, lineCy, 1, lineCx, lineCy, glowR)
            g.addColorStop(0, 'rgba(255,210,130,0.03)')
            g.addColorStop(1, 'rgba(255,210,130,0)')
            ctx.fillStyle = g
            ctx.fillRect(lineCx - glowR, lineCy - glowR, glowR * 2, glowR * 2)
          }

          if (progress > 0.40) {
            drawUnderline(ctx, cx, targetY, halfW, LINE_HEIGHT, eased3)
          }
        } else {
          if (!holdStartRef.current) {
            holdStartRef.current = time
          }

          drawUnderline(ctx, cx, targetY, LINE_HALF_WIDTH, LINE_HEIGHT, 1)

          if (time - holdStartRef.current > 800 && !doneFiredRef.current) {
            doneFiredRef.current = true
            onDoneRef.current()
          }
        }
      } else if (step === 'done') {
        drawUnderline(ctx, cx, targetY, LINE_HALF_WIDTH, LINE_HEIGHT, 1)
      }

      if (snakePointsRef) snakePointsRef.current = snakePts

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
        position: 'fixed', inset: 0, zIndex: 999998,
        pointerEvents: 'none',
      }}
    />
  )
}
