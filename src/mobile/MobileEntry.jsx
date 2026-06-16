import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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
const FORCE_CONTINUE_MS = 30000

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

  const loadingRef = useRef(false)
  const fullscreenDone = useRef(false)
  const forcedRef = useRef(false)
  const sceneDisposed = useRef(false)
  const loadedRef = useRef(false)

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

  // ─── LOADING — min 6s + prewarm ────────────────────────
  useEffect(() => {
    if (phase !== 'loading') return
    if (loadingRef.current) return
    loadingRef.current = true

    applyMobileQuality()

    const startTime = performance.now()
    const MIN_LOAD_MS = 6000

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
      setProgress(0.05)
      await sleep(300)

      setStatusText('Loading Models…')
      setProgress(0.10)

      const entries = getAssetEntries()

      try {
        await loadMobileAssets((val, path) => {
          const raw = 0.10 + val * 0.55
          setProgress(raw)
          setStatusText('Loading Models…')
        })
      } catch {}

      if (forcedRef.current) return

      loadedRef.current = true

      // ── wait until min 3.5s ───────────────────────────
      const t1 = performance.now() - startTime
      if (t1 < 3500) await sleep(3500 - t1)

      setStatusText('Building Scene…')
      setProgress(0.70)

      // ── mount hidden scene for prewarm ────────────────
      setStatusText('Warming GPU…')
      setProgress(0.82)
      setSceneMounted(true)

      // ── let scene warm (compile shaders, upload textures) ──
      await sleep(800)

      setStatusText('Optimising…')
      setProgress(0.90)

      // ── wait until min 5.5s ───────────────────────────
      const t2 = performance.now() - startTime
      if (t2 < 5500) await sleep(5500 - t2)

      setStatusText('Entering World…')
      setProgress(0.97)

      // ── wait until min 6s ─────────────────────────────
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

      console.log(
        `%c[Mobile] v${VERSION}%c ${entries.length} assets, ~${(totalBytes / 1024).toFixed(0)} KB | min ${MIN_LOAD_MS}ms + prewarm`,
        'color:#e8c660;font-weight:bold', 'color:#8a7d6a'
      )

      setProgress(1)
      await sleep(400)

      // ── show scene, hide loader ──────────────────────
      setSceneVisible(true)
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
      loadedRef.current = false
      loadingRef.current = false

      if (typeof window !== 'undefined') {
        window.__MOBILE_QUALITY = false
        window.__MOBILE_QUALITY_LEVEL = undefined
      }
    }
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
          <Suspense fallback={null}>
            <MobileScene prewarm={!sceneVisible} />
          </Suspense>
        </div>
      )}
      {sceneVisible && <VersionDisplay />}
    </>
  )
}
