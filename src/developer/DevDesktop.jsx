import { useEffect } from 'react'
import * as THREE from 'three'

export default function DevDesktop({ onTextureReady }) {
  useEffect(() => {
    let active = true
    try {
      const canvas = document.createElement('canvas')
      if (!canvas) return
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const sky = ctx.createLinearGradient(0, 0, 0, 480)
      sky.addColorStop(0, '#0a1628')
      sky.addColorStop(0.4, '#102040')
      sky.addColorStop(0.7, '#182838')
      sky.addColorStop(1, '#0a1a0a')
      if (sky) { ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 480) }

      ctx.fillStyle = '#0f2a0f'
      ctx.beginPath()
      ctx.moveTo(0, 480)
      for (let x = 0; x <= 640; x += 5) {
        const h = 320 + Math.sin(x * 0.005) * 50 + Math.sin(x * 0.012) * 30 + Math.sin(x * 0.025) * 15
        ctx.lineTo(x, h)
      }
      ctx.lineTo(640, 480); ctx.closePath(); ctx.fill()

      ctx.fillStyle = '#143814'
      ctx.beginPath()
      ctx.moveTo(0, 480)
      for (let x = 0; x <= 640; x += 5) {
        const h = 360 + Math.sin(x * 0.007 + 1) * 35 + Math.sin(x * 0.015 + 2) * 20
        ctx.lineTo(x, h)
      }
      ctx.lineTo(640, 480); ctx.closePath(); ctx.fill()

      if (ctx) {
        [[40, 40, '#ff5555'], [75, 40, '#55ff55'], [40, 75, '#5555ff'], [75, 75, '#ffff55']].forEach(([x, y, c]) => {
          ctx.fillStyle = c; ctx.fillRect(x, y, 28, 28)
        })

        ctx.fillStyle = 'rgba(10,10,10,0.75)'
        ctx.fillRect(0, 440, 640, 40)
        ctx.fillStyle = '#e8c660'
        ctx.fillRect(10, 444, 50, 32)

        ctx.fillStyle = 'rgba(0,0,0,0.025)'
        for (let sy = 3; sy < 480; sy += 3) ctx.fillRect(0, sy, 640, 1)
      }

      const tex = new THREE.CanvasTexture(canvas)
      if (!tex) return
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      if (active && onTextureReady) onTextureReady(tex)
    } catch (e) {
      console.warn('DevDesktop error:', e)
    }
    return () => { active = false }
  }, [onTextureReady])
  return null
}
