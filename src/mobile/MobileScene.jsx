import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import ScrollCinematicFlow from '../scenes/ScrollCinematicFlow'
import CinematicOverlay from '../ui/CinematicOverlay'
import CinematicTextSystem from '../ui/CinematicTextSystem'
import IntroOverlay from '../ui/IntroOverlay'
import useScrollScrub from '../core/useScrollScrub'
import { getSlowFactor } from '../core/narrativeRegistry'
import useScrollLimiter from './useScrollLimiter'
import applyMobileQuality from './MobileQualityProfile'
import AdaptiveQuality from './useAdaptiveQuality'

applyMobileQuality()

export default function MobileScene({ prewarm }) {
  const { progress: rawProgress } = useScrollScrub()
  const prevRawRef = useRef(rawProgress)
  const slowRef = useRef(rawProgress)

  const rawDelta = rawProgress - prevRawRef.current
  prevRawRef.current = rawProgress

  const limitedDelta = useScrollLimiter(rawDelta)

  if (limitedDelta > 0) {
    const sf = getSlowFactor()
    const lag = Math.max(0, rawProgress - slowRef.current)
    slowRef.current += limitedDelta * sf + lag * 0.04
    slowRef.current = Math.min(slowRef.current, rawProgress)
  } else if (limitedDelta < 0) {
    slowRef.current += limitedDelta
    slowRef.current = Math.max(slowRef.current, rawProgress)
  }

  const progress = Math.max(0, Math.min(1, slowRef.current))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5,
      opacity: prewarm ? 0 : 1,
      pointerEvents: prewarm ? 'none' : 'auto',
      transition: 'opacity 0.6s ease',
    }}>
      <IntroOverlay />
      <main className="cinematic-shell">
        <div className="canvas-stage">
          <Canvas
            dpr={[0.75, 1]}
            shadows={false}
            camera={{ position: [0, 1.60, -1.20], fov: 40.5, near: 0.1, far: 80 }}
            gl={{
              antialias: false,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.9,
            }}
            style={{ background: '#0c0b0a' }}
            onCreated={(state) => {
              state.gl.setPixelRatio(Math.min(1, window.devicePixelRatio || 1))
            }}
          >
            <AdaptiveQuality />
            <ScrollCinematicFlow progress={progress} />
          </Canvas>
        </div>
        <CinematicOverlay progress={progress} />
        <CinematicTextSystem progress={progress} />
        <div className="film-grain" aria-hidden="true" />
        <div className="scroll-track" aria-hidden="true" />
      </main>
    </div>
  )
}
