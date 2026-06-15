import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import RotatePhoneGate from './RotatePhoneOverlay'
import TouchToContinue from './TouchToContinue'
import MobileLoaderUI from './MobileLoaderUI'
import loadMobileAssets from './MobileAssetLoader'

const CinematicPortfolio = lazy(() => import('../core/CinematicPortfolio'))

const PROP_NAMES = {
  'Meshy_AI_Age_Wall_0611070403_texture.glb': 'Mesh Wall',
  'Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb': 'Steel City',
  'Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb': 'Map Install',
  'Meshy_AI_Time_in_Steel_0611065420_texture.glb': 'Time in Steel',
  'Meshy_AI_Python_Development_Ex_0611071109_texture.glb': 'Python Dev',
  'character.glb': 'Character',
}

export default function MobileEntry() {
  const [phase, setPhase] = useState('splash')
  const [stage, setStage] = useState('preparing')
  const [progress, setProgress] = useState(0)
  const [assetHint, setAssetHint] = useState('')
  const [sceneReady, setSceneReady] = useState(false)
  const loadingRef = useRef(false)

  // ─── SPLASH ─────────────────────────────────────────────────────
  if (phase === 'splash') {
    return <SplashScreen onContinue={() => setPhase('rotate')} />
  }

  // ─── ROTATE GATE ────────────────────────────────────────────────
  if (phase === 'rotate') {
    return <RotatePhoneGate onDismiss={() => setPhase('tap')} />
  }

  // ─── TAP GATE ───────────────────────────────────────────────────
  if (phase === 'tap') {
    return (
      <TouchToContinue
        onContinue={() => {
          setPhase('loading')
          setStage('preparing')
        }}
      />
    )
  }

  // ─── LOADING ────────────────────────────────────────────────────
  if (!sceneReady) {
    return <LoadingPhase
      stage={stage}
      progress={progress}
      assetHint={assetHint}
      setStage={setStage}
      setProgress={setProgress}
      setAssetHint={setAssetHint}
      setSceneReady={setSceneReady}
      loadingRef={loadingRef}
    />
  }

  // ─── SCENE ──────────────────────────────────────────────────────
  return (
    <Suspense fallback={<MobileLoaderUI stage="entering" progress={0.99} />}>
      <CinematicPortfolio />
    </Suspense>
  )
}

function SplashScreen({ onContinue }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
  }, [])

  useEffect(() => {
    const timer = setTimeout(onContinue, 3500)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#080808',
      padding: '0 24px',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#e8c660" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <circle cx="16" cy="16" r="12" />
          <path d="M12 20 L20 12 M12 12 L20 20" />
        </svg>
        <p style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)',
          color: '#c8bfae',
          lineHeight: 1.7,
          maxWidth: 320,
          margin: 0,
        }}>
          This experience was designed for desktop devices with dedicated graphics. Performance on mobile devices may vary.
        </p>
      </div>

      <p style={{
        fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
        fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
        color: '#5a4e3a',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        Preparing Mobile Interface
      </p>
    </div>
  )
}

function LoadingPhase({ stage, progress, assetHint, setStage, setProgress, setAssetHint, setSceneReady, loadingRef }) {
  const doneRef = useRef(false)
  const [fadeOut, setFadeOut] = useState(false)

  const handleProgress = useCallback((value, path) => {
    const name = path?.split('/').pop() ?? ''
    const hint = PROP_NAMES[name] || name.replace(/\.glb$/, '')
    setAssetHint(hint)
    setProgress(value)
  }, [])

  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true

    async function start() {
      setStage('preparing')
      await new Promise(r => setTimeout(r, 600))

      useGLTF.setDecoderPath('/draco/')

      setStage('loading')
      try {
        await loadMobileAssets(handleProgress)
      } catch (err) {
        setProgress(1)
        setStage('entering')
        setFadeOut(true)
        await new Promise(r => setTimeout(r, 500))
        setSceneReady(true)
        return
      }

      if (doneRef.current) return
      setStage('rendering')
      setProgress(0.85)

      await new Promise(r => requestAnimationFrame(r))
      await new Promise(r => requestAnimationFrame(r))

      if (doneRef.current) return
      setStage('entering')
      setProgress(0.95)

      await new Promise(r => setTimeout(r, 400))

      if (doneRef.current) return
      setFadeOut(true)
      await new Promise(r => setTimeout(r, 400))
      setProgress(1)
      setSceneReady(true)
    }

    start()

    return () => { doneRef.current = true }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: '#080808',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      <MobileLoaderUI stage={stage} progress={progress} assetHint={assetHint} />
    </div>
  )
}
