import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const GREEN = '#33ff33'

export default function DevBootText({ onTextureReady }) {
  useEffect(() => {
    let active = true
    try {
      const canvas = document.createElement('canvas')
      if (!canvas) return
      canvas.width = 640
      canvas.height = 480
      const tex = new THREE.CanvasTexture(canvas)
      if (!tex) return
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      if (active && onTextureReady) onTextureReady(tex)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let start = performance.now()

      function draw() {
        if (!active) return
        try {
          const t = (performance.now() - start) / 1000

          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, 640, 480)
          ctx.font = '15px "Courier New", monospace'
          ctx.textBaseline = 'top'

          ctx.fillStyle = GREEN
          ctx.fillText('C:>', 40, 60)

          if (t >= 0.3 && t < 1.5) {
            const n = Math.min(3, Math.floor((t - 0.3) * 5))
            ctx.fillText('ABC'.substring(0, n), 100, 60)
            if (n >= 3 && Math.floor(t * 3) % 2 === 0) ctx.fillText('_', 100 + ctx.measureText('ABC').width - 2, 60)
          }
          if (t >= 1.5 && t < 2.5) {
            ctx.fillText('ABC', 100, 60)
            if (Math.floor(t * 2) % 2 === 0) ctx.fillText('_', 100 + ctx.measureText('ABC').width - 2, 60)
          }

          if (t >= 2.5) ctx.fillText('C:>', 40, 100)
          if (t >= 2.8 && t < 3.5) {
            const n = Math.min(3, Math.floor((t - 2.8) * 5))
            ctx.fillText('ABC'.substring(0, n), 100, 100)
          }
          if (t >= 3.5) ctx.fillText('ABC', 100, 100)

          if (t >= 3.5) {
            const msg = 'BOOTING DEV MODE...'
            const p = (t - 3.5) / 3.0
            let n = Math.floor(msg.length * p)
            for (let i = 0; i < n; i++) {
              if ((i % 3 === 0 && t > 3.5 + i * 0.12) || (i % 3 !== 0 && t > 3.5 + i * 0.07)) continue
              n = i; break
            }
            n = Math.max(1, Math.min(msg.length, n))
            const inst = 0.85 + Math.sin(t * 23.0) * 0.08 + Math.sin(t * 47.0) * 0.04
            ctx.globalAlpha = Math.min(1, Math.max(0.6, inst))
            ctx.fillText(msg.substring(0, n), 40, 140)
            ctx.globalAlpha = 1.0
            if (n < msg.length && Math.floor(t * 3) % 2 === 0)
              ctx.fillText('_', 40 + ctx.measureText(msg.substring(0, n)).width, 140)
            else if (n >= msg.length && Math.floor(t * 2) % 2 === 0)
              ctx.fillText('_', 40 + ctx.measureText(msg).width, 140)
          }

          ctx.fillStyle = 'rgba(0,0,0,0.03)'
          for (let sy = 3; sy < 480; sy += 3) ctx.fillRect(0, sy, 640, 1)

          tex.needsUpdate = true
        } catch (e) {
          console.warn('DevBootText frame error:', e)
        }
        if (active) requestAnimationFrame(draw)
      }
      draw()
    } catch (e) {
      console.warn('DevBootText error:', e)
    }
    return () => { active = false }
  }, [])
  return null
}
