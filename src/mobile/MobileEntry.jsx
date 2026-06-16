import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import useDeviceProfile from './useDeviceProfile'
import MobileLoader from './MobileLoader'
import loadMobileAssets from './MobileAssetLoader'
import { progressToLabel, progressToPct } from './MobileLoadingState'
import { getAssetEntries } from './AssetMap'
import { VERSION } from './version'
import applyMobileQuality from './MobileQualityProfile'
import VersionDisplay from './version'

const MobileScene = lazy(() => import('./MobileScene'))
const FORCE_CONTINUE_MS = 30000

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

const PROP_NAMES = {
  'Meshy_AI_Age_Wall_0611070403_texture.glb': 'Models',
  'Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb': 'Models',
  'Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb': 'Models',
  'Meshy_AI_Time_in_Steel_0611065420_texture.glb': 'Models',
  'Meshy_AI_Python_Development_Ex_0611071109_texture.glb': 'Models',
  'character.glb': 'Character',
}

export default function MobileEntry() {
  useDeviceProfile()
  const [sceneReady, setSceneReady] = useState(false)
  const [phase, setPhase] = useState('warning')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Preparing assets…')
  const loadingRef = useRef(false)
  const fullscreenDone = useRef(false)
  const forcedRef = useRef(false)

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

  // ─── LOADING ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'loading') return
    if (loadingRef.current) return
    loadingRef.current = true

    const forceTimer = setTimeout(() => {
      if (forcedRef.current) return
      forcedRef.current = true
      setProgress(1)
      setStatusText('Finalising…')
      setTimeout(() => setSceneReady(true), 1000)
    }, FORCE_CONTINUE_MS)

    async function run() {
      useGLTF.setDecoderPath('/draco/')

      setStatusText('Preparing assets…')
      setProgress(0.05)

      await new Promise(r => setTimeout(r, 300))

      setStatusText('Loading models…')
      setProgress(0.10)

      const entries = getAssetEntries()

      try {
        await loadMobileAssets((val, path) => {
          const raw = 0.10 + val * 0.75
          setProgress(raw)
          setStatusText(progressToLabel(raw))
        })
      } catch {}

      if (forcedRef.current) return

      clearTimeout(forceTimer)

      const totalBytes = entries.reduce((s, [, mobilePath]) => {
        try {
          const size = Number(sessionStorage.getItem('mob_size_' + mobilePath)) || 0
          return s + size
        } catch { return s }
      }, 0)

      console.log(
        `%c[Mobile] Props Loaded%c ${entries.length} assets, ~${(totalBytes / 1024).toFixed(0)} KB compressed`,
        'color:#e8c660;font-weight:bold', 'color:#8a7d6a'
      )

      setProgress(0.90)
      setStatusText('Finalising…')
      await new Promise(r => setTimeout(r, 1000))

      if (forcedRef.current) return

      setProgress(0.97)

      await new Promise(r => setTimeout(r, 800))

      if (forcedRef.current) return

      applyMobileQuality()

      console.log(
        `%c[Mobile] %cVersion ${VERSION} — Mobile Quality Enabled, Compressed Props Enabled, Scroll Limiter Enabled`,
        'color:#e8c660;font-weight:bold', 'color:#8a7d6a'
      )

      setProgress(1)
      setSceneReady(true)
    }

    run()

    return () => {
      clearTimeout(forceTimer)
      forcedRef.current = true
    }
  }, [phase])

  // ─── SCREEN ROUTING ────────────────────────────────────
  if (phase === 'warning') {
    return <MobileLoader phase="warning" onContinue={handleWarningContinue} />
  }

  if (phase === 'rotate') {
    return <MobileLoader phase="rotate" />
  }

  if (phase === 'fullscreen') {
    return <MobileLoader phase="fullscreen" onTap={handleTap} />
  }

  // ← FIX: loading phase yields when sceneReady=true
  if (phase === 'loading' && !sceneReady) {
    return (
      <MobileLoader
        phase="loading"
        progress={progress}
        statusText={statusText}
      />
    )
  }

  if (!sceneReady) return null

  return (
    <>
      <Suspense fallback={null}>
        <MobileScene />
      </Suspense>
      <VersionDisplay />
    </>
  )
}
