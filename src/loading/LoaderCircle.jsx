import { useEffect, useRef } from 'react'

export default function LoaderCircle({ progress }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const angleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = 280
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = 120
    const thickness = 10

    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      angleRef.current += 0.75 * 0.02
      const drawAngle = (angleRef.current % (Math.PI * 2))

      ctx.beginPath()
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + drawAngle)
      ctx.strokeStyle = '#E8C660'
      ctx.lineWidth = thickness
      ctx.lineCap = 'round'
      ctx.stroke()

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 84,
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}
        >
          LOADING
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: 'rgba(255,255,255,0.40)',
            letterSpacing: '0.10em',
            marginTop: 8,
          }}
        >
          {progress}%
        </div>
      </div>
    </div>
  )
}
