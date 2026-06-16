import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { VERSION } from './version'

const S = {
  position: 'fixed',
  bottom: 32,
  right: 10,
  zIndex: 99999,
  fontFamily: 'monospace',
  fontSize: '8px',
  color: 'rgba(255,255,255,0.3)',
  lineHeight: 1.6,
  textAlign: 'right',
  pointerEvents: 'none',
  userSelect: 'none',
}

const memStore = { fps: 0, draws: 0, textures: 0, geos: 0 }

export function DebugCanvasMetrics() {
  const { gl } = useThree()
  const fc = useRef(0)
  const lt = useRef(performance.now())

  useFrame(() => {
    fc.current++
    const now = performance.now()
    if (now - lt.current < 500) return
    const fps = Math.round(fc.current / ((now - lt.current) / 1000))
    fc.current = 0
    lt.current = now
    const info = gl.info
    memStore.fps = fps
    memStore.draws = info.render?.calls ?? 0
    memStore.textures = info.memory?.textures ?? 0
    memStore.geos = info.memory?.geometries ?? 0
  })

  return null
}

export default function MobileDebugStats() {
  const [m, setM] = useState({ ...memStore })

  useEffect(() => {
    const t = setInterval(() => setM({ ...memStore }), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={S}>
      v{VERSION}<br />
      {m.fps} FPS<br />
      {m.draws} draws<br />
      {m.textures} tex
    </div>
  )
}
