import { useRef, useCallback, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import ScrollCinematicFlow from '../scenes/ScrollCinematicFlow'
import IntroOverlay from '../ui/IntroOverlay'
import useScrollScrub from '../core/useScrollScrub'
import { getSlowFactor } from '../core/narrativeRegistry'
import useScrollLimiter from './useScrollLimiter'
import applyMobileQuality from './MobileQualityProfile'
import { applyRendererProfile, MOBILE_RENDERER } from './MobileRendererProfile'
import AdaptiveQuality from './useAdaptiveQuality'
import { MemoizedOverlay, MemoizedTextSystem } from './MobileMemoUI'
import useForwardOnlyScroll from './useForwardOnlyScroll'
import ForwardOnlyOverlay from './ForwardOnlyOverlay'
import MobileScrollHint from './MobileScrollHint'
import WarmupPhase from './WarmupPhase'
import FrameScheduler from './FrameScheduler'

applyMobileQuality()

const SNAP_THRESHOLD = 0.0005
const DRIFT_DEADZONE = 0.00001

export default function MobileScene({ prewarm, onRestart }) {
  const { progress: rawProgress, target: rawTarget } = useScrollScrub()
  const prevRawRef = useRef(rawProgress)
  const slowRef = useRef(rawProgress)
  const idleFrames = useRef(0)

  const [isScrolling, setIsScrolling] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const scrollTimer = useRef(null)
  const firstScrollRef = useRef(false)

  useEffect(() => {
    setIsScrolling(true)
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      setIsScrolling(false)
    }, 500)
  }, [rawProgress])

  useEffect(() => {
    if (!prewarm && rawProgress > 0.015 && !firstScrollRef.current) {
      firstScrollRef.current = true
      setShowHint(false)
    }
  }, [prewarm, rawProgress])

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

  const progress = Math.max(0, Math.min(1, slowRef.current))

  const handleStartAgain = useCallback(() => {
    reset()
    onRestart?.()
  }, [reset, onRestart])

  const hintVisible = !prewarm && (showHint || blocked)

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
              frameloop="demand"
              dpr={MOBILE_RENDERER.dpr}
              shadows={MOBILE_RENDERER.shadows}
              camera={MOBILE_RENDERER.camera}
              gl={MOBILE_RENDERER.gl}
              style={{ background: '#0c0b0a' }}
              onCreated={(state) => {
                applyRendererProfile(state.gl)
              }}
            >
              <FrameScheduler active={isScrolling} />
              <WarmupPhase />
              <AdaptiveQuality />
              <ScrollCinematicFlow progress={progress} />
            </Canvas>
          </div>
          <MemoizedOverlay progress={progress} />
          <MemoizedTextSystem progress={progress} />
          <div className="film-grain" aria-hidden="true" />
          <div className="scroll-track" aria-hidden="true" />
        </main>
      </div>
      <ForwardOnlyOverlay visible={blocked} onStartAgain={handleStartAgain} />
      <MobileScrollHint visible={hintVisible} />
    </>
  )
}
