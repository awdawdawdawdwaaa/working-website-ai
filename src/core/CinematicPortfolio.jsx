import { useRef, useState, useEffect } from 'react'
import { Canvas }          from '@react-three/fiber'
import * as THREE          from 'three'
import ScrollCinematicFlow from '../scenes/ScrollCinematicFlow'
import CinematicOverlay    from '../ui/CinematicOverlay'
import CinematicTextSystem from '../ui/CinematicTextSystem'
import IntroOverlay from '../ui/IntroOverlay'
import useScrollScrub      from './useScrollScrub'
import { getSlowFactor } from './narrativeRegistry'
import useLoaderTransition from '../loading/useLoaderTransition'
import CircleToUnderlineLoader from '../loading/CircleToUnderlineLoader'
import LineFieldSystem from '../loading/LineFieldSystem'
import LoaderJokes from '../loading/LoaderJokes'
import ParticleField from '../loading/ParticleField'
import useLoaderRelease from '../loading/useLoaderRelease'

export default function CinematicPortfolio() {
  const { phase, finishMorph } = useLoaderTransition()
  const { releaseStep, onExpansionDone } = useLoaderRelease(phase, finishMorph)
  const { progress: rawProgress } = useScrollScrub()
  const prevRawRef = useRef(rawProgress)
  const slowRef = useRef(rawProgress)
  const snakePointsRef = useRef([])
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    if (phase === 'ending' || phase === 'done') {
      requestAnimationFrame(() => setFadeIn(true))
    }
  }, [phase])

  const rawDelta = rawProgress - prevRawRef.current
  prevRawRef.current = rawProgress

  if (rawDelta > 0) {
    const sf = getSlowFactor()
    const lag = Math.max(0, rawProgress - slowRef.current)
    slowRef.current += rawDelta * sf + lag * 0.04
    slowRef.current = Math.min(slowRef.current, rawProgress)
  } else {
    slowRef.current += rawDelta
    slowRef.current = Math.max(slowRef.current, rawProgress)
  }

  const progress = Math.max(0, Math.min(1, slowRef.current))
  const sceneOpacity = fadeIn || phase === 'done' ? 1 : 0

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 5,
        opacity: sceneOpacity,
        transition: fadeIn ? 'opacity 0.6s ease' : 'none',
        pointerEvents: phase === 'done' ? 'auto' : 'none',
      }}>
        {(fadeIn || phase === 'done') && <IntroOverlay />}
        <main className="cinematic-shell">
          <div className="canvas-stage">
            <Canvas
              dpr={[1, 1.5]}
              shadows={{ type: THREE.PCFSoftShadowMap }}
              camera={{ position: [0, 1.60, -1.20], fov: 40.5, near: 0.1, far: 80 }}
              gl={{
                antialias: true,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 0.9,
              }}
              style={{ background: '#0c0b0a' }}
            >
              <ScrollCinematicFlow progress={progress} />
            </Canvas>
          </div>
          <CinematicOverlay progress={progress} />
          <CinematicTextSystem progress={progress} />
          <div className="film-grain" aria-hidden="true" />
          <div className="scroll-track" aria-hidden="true" />
        </main>
      </div>

      {phase !== 'done' && (
        <div className={phase === 'ending' ? 'loader loader--fade' : 'loader'} style={{ zIndex: 10 }}>
          <LineFieldSystem
            excludeX={window.innerWidth / 2}
            excludeY={window.innerHeight / 2}
            excludeRadius={200}
            snakePointsRef={snakePointsRef}
          />
          <div style={{ opacity: 0, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <CircleToUnderlineLoader
              releaseStep={releaseStep}
              onExpansionDone={onExpansionDone}
              snakePointsRef={snakePointsRef}
            />
          </div>
          <ParticleField snakePointsRef={snakePointsRef} releaseStep={releaseStep} />
          <LoaderJokes />
        </div>
      )}
    </>
  )
}
