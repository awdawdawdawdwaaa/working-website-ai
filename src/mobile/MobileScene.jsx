import { useRef, useCallback } from 'react'
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
import useForwardOnlyScroll from './useForwardOnlyScroll'
import ForwardOnlyOverlay from './ForwardOnlyOverlay'
import WarmupPhase from './WarmupPhase'

applyMobileQuality()

const SNAP_THRESHOLD = 0.0005
const DRIFT_DEADZONE = 0.00001

export default function MobileScene({ prewarm, onRestart }) {
  const { progress: rawProgress, target: rawTarget } = useScrollScrub()
  const prevRawRef = useRef(rawProgress)
  const slowRef = useRef(rawProgress)
  const idleFrames = useRef(0)

  const { blocked, effectiveProgress, reset } = useForwardOnlyScroll(rawProgress)

  const rawDelta = rawProgress - prevRawRef.current
  prevRawRef.current = rawProgress

  const limitedDelta = useScrollLimiter(rawDelta)

  const baseProgress = blocked ? effectiveProgress : rawProgress

  if (limitedDelta > 0) {
    const sf = getSlowFactor()
    const lag = Math.max(0, baseProgress - slowRef.current)
    slowRef.current += limitedDelta * sf + lag * 0.04
    slowRef.current = Math.min(slowRef.current, baseProgress)
  } else if (limitedDelta < 0) {
    slowRef.current += limitedDelta
    slowRef.current = Math.max(slowRef.current, baseProgress)
  }

  // ── deadzone: stop drift when user stops scrolling ──
  const drift = Math.abs(baseProgress - slowRef.current)
  if (Math.abs(limitedDelta) < DRIFT_DEADZONE) {
    idleFrames.current++
  } else {
    idleFrames.current = 0
  }
  if (drift < SNAP_THRESHOLD && idleFrames.current > 3) {
    slowRef.current = baseProgress
  } else if (drift < 0.0001) {
    slowRef.current = baseProgress
  }

  // ── scroll velocity log (every 5 frames) ──
  const logCounter = useRef(0)
  logCounter.current++
  if (logCounter.current % 5 === 0 && Math.abs(limitedDelta) > 0.001) {
    console.log(
      `%c[Scroll] Velocity: ${(limitedDelta * 1000).toFixed(2)}e-3 | Target: ${(rawTarget * 100).toFixed(1)}% | Actual: ${(baseProgress * 100).toFixed(1)}% | FrameGap: ${(drift * 100).toFixed(2)}%`,
      'color:#6a5e4a'
    )
  }

  const progress = Math.max(0, Math.min(1, slowRef.current))

  const handleStartAgain = useCallback(() => {
    console.log('%c[Restart] Returning to first screen', 'color:#e8c660')
    reset()
    onRestart?.()
  }, [reset, onRestart])

  return (
    <>
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
              <WarmupPhase />
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
      {blocked && <ForwardOnlyOverlay onStartAgain={handleStartAgain} />}
    </>
  )
}
