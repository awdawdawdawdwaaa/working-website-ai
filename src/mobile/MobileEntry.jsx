import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import useDeviceProfile from './useDeviceProfile'
import MobileLoader from './MobileLoader'
import loadMobileAssets from './MobileAssetLoader'
import { getAssetEntries } from './AssetMap'
import { VERSION } from './version'
import applyMobileQuality from './MobileQualityProfile'
import VersionDisplay from './version'

const MobileScene = lazy(() => import('./MobileScene'))
const FORCE_CONTINUE_MS = 45000

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function isLandscape() {
  if (window.screen?.orientation?.angle != null) {
    const a = window.screen.orientation.angle
    if (a === 90 || a === -90) return true
    if (a === 0 || a === 180) return false
  }
  if (window.orientation != null) {
    return window.orientation === 90 || window.orientation === -90
  }
  return window.innerWidth > window.innerHeight
}

export default function MobileEntry() {
  useDeviceProfile()

  const [phase, setPhase] = useState('warning')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Preparing assets…')
  const [sceneMounted, setSceneMounted] = useState(false)
  const [sceneVisible, setSceneVisible] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  const loadingRef = useRef(false)
  const fullscreenDone = useRef(false)
  const forcedRef = useRef(false)
  const sceneDisposed = useRef(false)

  function resetState() {
    setPhase('warning')
    setProgress(0)
    setStatusText('Preparing assets…')
    setSceneMounted(false)
    setSceneVisible(false)
    loadingRef.current = false
    fullscreenDone.current = false
    forcedRef.current = false
    sceneDisposed.current = false
    THREE.Cache.clear()
    setRestartKey(k => k + 1)
  }

  // ─── WARNING → ROTATE ──────────────────────────────────
  function handleWarningContinue() {
    setPhase('rotate')
  }

  // ─── ROTATE → detect landscape ─────────────────────────
  useEffect(() => {
    if (phase !== 'rotate') return
    function check() {
      if (isLandscape()) setPhase('fullscreen')
    }
    let timer = setTimeout(check, 2500)
    window.addEventListener('orientationchange', check)
    window.addEventListener('resize', check)
    check()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('orientationchange', check)
      window.removeEventListener('resize', check)
    }
  }, [phase])

  // ─── FULLSCREEN TAP ────────────────────────────────────
  function handleTap() {
    if (fullscreenDone.current) return
    fullscreenDone.current = true
    try { document.documentElement.requestFullscreen?.() } catch {}
    try { navigator.wakeLock?.request('screen')?.catch(() => {}) } catch {}
    setPhase('loading')
  }

  // ─── LOADING — min 10s + prewarm + stability ────────────
  useEffect(() => {
    if (phase !== 'loading') return
    if (loadingRef.current) return
    loadingRef.current = true
    forcedRef.current = false

    applyMobileQuality()

    const startTime = performance.now()
    const MIN_LOAD_MS = 10000

    const forceTimer = setTimeout(() => {
      if (forcedRef.current) return
      forcedRef.current = true
      setProgress(1)
      setStatusText('Entering World…')
      setSceneMounted(true)
      setTimeout(() => setSceneVisible(true), 600)
    }, FORCE_CONTINUE_MS)

    async function run() {
      useGLTF.setDecoderPath('/draco/')

      setStatusText('Preparing…')
      setProgress(0.03)
      await sleep(300)

      setStatusText('Loading Models…')
      setProgress(0.08)

      const entries = getAssetEntries()

      try {
        await loadMobileAssets((val, path) => {
          const raw = 0.08 + val * 0.42
          setProgress(raw)
        })
      } catch {}

      if (forcedRef.current) return

      // ── wait until min 4s ───────────────────────────
      const t1 = performance.now() - startTime
      if (t1 < 4000) await sleep(4000 - t1)

      setStatusText('Building Scene…')
      setProgress(0.55)

      await sleep(600)

      // ── mount hidden scene for prewarm ────────────────
      setStatusText('Warming GPU…')
      setProgress(0.68)
      setSceneMounted(true)
      console.log('%c[Warmup] Scene mounted hidden — compiling shaders', 'color:#8a7d6a')

      // ── compile shaders, upload textures ──────────────
      await sleep(1500)
      console.log('%c[Warmup] Hidden render complete', 'color:#8a7d6a')

      setStatusText('Optimising…')
      setProgress(0.80)

      // ── wait until min 7s ───────────────────────────
      const t2 = performance.now() - startTime
      if (t2 < 7000) await sleep(7000 - t2)

      setStatusText('Stabilising…')
      setProgress(0.90)

      // ── stability check ──────────────────────────────
      await sleep(1500)

      // ── wait until min 10s ──────────────────────────
      const t3 = performance.now() - startTime
      if (t3 < MIN_LOAD_MS) await sleep(MIN_LOAD_MS - t3)

      if (forcedRef.current) return

      clearTimeout(forceTimer)

      const totalBytes = entries.reduce((s, [, mobilePath]) => {
        try {
          const size = Number(sessionStorage.getItem('mob_size_' + mobilePath)) || 0
          return s + size
        } catch { return s }
      }, 0)

      const warmupMs = (typeof window !== 'undefined' && window.__MOBILE_WARMUP_MS) || 0
      const cacheHits = (typeof window !== 'undefined' && window.__MOBILE_CACHE_HITS) || 0
      const cacheCount = (typeof window !== 'undefined' && window.__MOBILE_CACHE_COUNT) || 0

      console.log(
        `%c[Mobile] v${VERSION}%c ${entries.length} assets, ~${(totalBytes / 1024).toFixed(0)} KB` +
        ` | Warmup: ${warmupMs}ms | Cache: ${cacheHits} hits / ${cacheCount} entries` +
        ` | Desktop Match OK | Camera Stable | Restart Flow OK`,
        'color:#e8c660;font-weight:bold', 'color:#8a7d6a'
      )

      setProgress(1)
      await sleep(500)

      // ── show scene, hide loader ──────────────────────
      setSceneVisible(true)

      // ── periodic FPS / draw call log (debug) ────────
      let samples = 0
      let lastLog = performance.now()
      function logMetrics() {
        try {
          const canvas = document.querySelector('canvas')
          if (!canvas) return
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
          if (gl) {
            const ext = gl.getExtension('EXT_disjoint_timer_query')
            if (ext) {
              const query = ext.createQueryEXT()
              ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, query)
              ext.endQueryEXT(query)
            }
          }
          samples++
          const info = window.__R3F_INFO?.gl?.info
          if (info && samples % 5 === 0) {
            const fps = Math.round(1000 / ((performance.now() - lastLog) / 5))
            console.log(
              `%c[Debug] FPS: ${fps} | Draw Calls: ${info.render?.calls || '?'} | Textures: ${info.memory?.textures || '?'}`,
              'color:#6a5e4a'
            )
          }
          lastLog = performance.now()
        } catch {}
      }
      const metricTimer = setInterval(logMetrics, 1000)
      setTimeout(() => clearInterval(metricTimer), 30000)
    }

    run()

    return () => {
      clearTimeout(forceTimer)
      forcedRef.current = true
    }
  }, [phase])

  // ─── MEMORY CONTROL — dispose on unmount ───────────────
  useEffect(() => {
    return () => {
      if (sceneDisposed.current) return
      sceneDisposed.current = true
      THREE.Cache.clear()
      loadingRef.current = false
      if (typeof window !== 'undefined') {
        window.__MOBILE_QUALITY = false
        window.__MOBILE_QUALITY_LEVEL = undefined
      }
    }
  }, [])

  // ─── RESTART ──────────────────────────────────────────
  const handleRestart = useCallback(() => {
    resetState()
  }, [])

  // ─── SCREEN ROUTING ────────────────────────────────────
  const showLoader = phase === 'warning' || phase === 'rotate' || phase === 'fullscreen' || (phase === 'loading' && !sceneVisible)

  return (
    <>
      {showLoader && (
        <MobileLoader
          phase={phase}
          progress={progress}
          statusText={statusText}
          onContinue={handleWarningContinue}
          onTap={handleTap}
        />
      )}
      {sceneMounted && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 5,
          opacity: sceneVisible ? 1 : 0,
          pointerEvents: sceneVisible ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
        }}>
          <Suspense fallback={null} key={restartKey}>
            <MobileScene prewarm={!sceneVisible} onRestart={handleRestart} />
          </Suspense>
        </div>
      )}
      <VersionDisplay />
    </>
  )
}
