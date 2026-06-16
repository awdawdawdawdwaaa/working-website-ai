import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import useDeviceProfile from './useDeviceProfile'
import MobileLoader from './MobileLoader'
import loadMobileAssets from './MobileAssetLoader'

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
  'Meshy_AI_Age_Wall_0611070403_texture.glb': 'Age Wall',
  'Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb': 'Steel City',
  'Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb': 'Map Install',
  'Meshy_AI_Time_in_Steel_0611065420_texture.glb': 'Time in Steel',
  'Meshy_AI_Python_Development_Ex_0611071109_texture.glb': 'Python Dev',
  'character.glb': 'Character',
}

export default function MobileEntry() {
  const { isMobile } = useDeviceProfile()
  const [sceneReady, setSceneReady] = useState(false)
  const [loaderPhase, setLoaderPhase] = useState('rotate')
  const [progress, setProgress] = useState(0)
  const [assetHint, setAssetHint] = useState('')
  const loadingRef = useRef(false)

  // ─── ROTATE → detect landscape ─────────────────────────
  useEffect(() => {
    if (loaderPhase !== 'rotate') return
    function check() {
      if (isLandscape()) setLoaderPhase('loading')
    }
    let timer = setTimeout(check, 3000)
    window.addEventListener('orientationchange', check)
    window.addEventListener('resize', check)
    check()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('orientationchange', check)
      window.removeEventListener('resize', check)
    }
  }, [loaderPhase])

  // ─── LOADING ───────────────────────────────────────────
  useEffect(() => {
    if (loaderPhase !== 'loading') return
    if (loadingRef.current) return
    loadingRef.current = true

    async function run() {
      useGLTF.setDecoderPath('/draco/')
      try {
        await loadMobileAssets((val, path) => {
          const name = path?.split('/').pop() ?? ''
          setAssetHint(PROP_NAMES[name] || name.replace(/\.glb$/, ''))
          setProgress(val)
        })
      } catch {}
      setLoaderPhase('tap')
    }
    run()
  }, [loaderPhase])

  // ─── SCREEN ROUTING ────────────────────────────────────
  if (loaderPhase === 'rotate' || loaderPhase === 'loading') {
    return <MobileLoader phase={loaderPhase} progress={progress} assetHint={assetHint} />
  }

  if (loaderPhase === 'tap') {
    return (
      <MobileLoader
        phase="tap"
        onTapContinue={() => {
          try { document.documentElement.requestFullscreen?.() } catch {}
          try { navigator.wakeLock?.request('screen') } catch {}
          setLoaderPhase('warning')
        }}
      />
    )
  }

  if (loaderPhase === 'warning') {
    return (
      <MobileLoader
        phase="warning"
        onWarningContinue={() => setSceneReady(true)}
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
