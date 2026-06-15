import { useEffect, useRef } from 'react'

const MAX_DOTS = 800
const REPEL_RADIUS = 350
const REPEL_FORCE = 2.00
const SPRING = 0.015
const DAMPING = 0.85

export default function LoaderDots() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const dotsRef = useRef(null)
  const fpsRef = useRef({ frames: 0, last: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let count = MAX_DOTS
    const dots = Array.from({ length: count }, () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        x, y, ox: x, oy: y,
        vx: 0, vy: 0,
        r: 1.5 + Math.random() * 1.5,
      }
    })
    dotsRef.current = dots

    const animate = (time) => {
      // FPS cap
      if (time - fpsRef.current.last < 16) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      fpsRef.current.last = time

      fpsRef.current.frames++
      if (time - fpsRef.current.last > 1000) {
        const fps = fpsRef.current.frames
        fpsRef.current.frames = 0
        if (fps < 25 && dots.length > 400) {
          dots.length = Math.max(400, dots.length - 80)
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const dot of dots) {
        const dx = dot.x - mx
        const dy = dot.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
          const nx = dx / dist
          const ny = dy / dist
          dot.vx += nx * force * REPEL_FORCE
          dot.vy += ny * force * REPEL_FORCE
        }

        dot.vx += (dot.ox - dot.x) * SPRING
        dot.vy += (dot.oy - dot.y) * SPRING
        dot.vx *= DAMPING
        dot.vy *= DAMPING
        dot.x += dot.vx
        dot.y += dot.vy

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
