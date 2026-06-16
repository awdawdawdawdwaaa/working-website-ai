import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import useDeviceProfile from './useDeviceProfile'
import MobileLoader from './MobileLoader'
import loadMobileAssets from './MobileAssetLoader'
import { progressToLabel, progressToPct } from './MobileLoadingState'

const MobileScene = lazy(() => import('./MobileScene'))

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

    async function run() {
      useGLTF.setDecoderPath('/draco/')

      setStatusText('Preparing assets…')
      setProgress(0.05)

      await new Promise(r => setTimeout(r, 400))

      setStatusText('Loading models…')
      try {
        await loadMobileAssets((val, path) => {
          const raw = 0.05 + val * 0.65
          setProgress(raw)
          setStatusText(progressToLabel(raw))
        })
      } catch {}

      setProgress(0.70)
      setStatusText('Loading environment…')
      await new Promise(r => setTimeout(r, 300))

      setProgress(0.80)
      setStatusText('Optimising textures…')
      await new Promise(r => setTimeout(r, 300))

      setProgress(0.90)
      setStatusText('Building scene…')
      await new Promise(r => setTimeout(r, 400))

      setProgress(0.97)
      setStatusText('Finalising…')
      await new Promise(r => setTimeout(r, 500))

      setProgress(1)
      setStatusText('Finalising…')
      await new Promise(r => setTimeout(r, 200))

      setSceneReady(true)
    }

    run()
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

  if (phase === 'loading') {
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
    <Suspense fallback={null}>
      <MobileScene />
    </Suspense>
  )
}
