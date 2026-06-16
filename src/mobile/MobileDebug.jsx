import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { VERSION } from './version'

const MINI = {
  position: 'fixed',
  top: 10,
  right: 10,
  zIndex: 99999,
  fontFamily: 'monospace',
  fontSize: '9px',
  color: 'rgba(255,255,255,0.4)',
  lineHeight: 1.5,
  textAlign: 'right',
  pointerEvents: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

export function DebugOverlay() {
  const { gl } = useThree()
  const [fps, setFps] = useState(0)
  const [draws, setDraws] = useState(0)
  const [tex, setTex] = useState(0)

  useEffect(() => {
    let raf
    let last = performance.now()
    let frames = 0

    function tick() {
      raf = requestAnimationFrame(tick)
      frames++
      const now = performance.now()
      if (now - last >= 1000) {
        setFps(frames)
        setDraws(gl.info.render?.calls ?? 0)
        setTex(gl.info.memory?.textures ?? 0)
        frames = 0
        last = now
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gl])

  return null
}

export default function MobileDebugStats() {
  return (
    <div style={MINI}>
      v{VERSION}
    </div>
  )
}
