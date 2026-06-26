import { Component, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import DevStage1PC from './DevStage1PC'
import DevStage2Monitor from './DevStage2Monitor'
import DevStage3Room from './DevStage3Room'
import DevStageMouse from './DevStageMouse'
import DevStageKeyboard from './DevStageKeyboard'
import DevDeskLamp from './DevDeskLamp'
import DevModeUI from './DevModeUI'
import DevOrbitControls from './DevOrbitControls'
import { LightingProvider, useLighting } from './LightingContext'
import { stopAll } from './DevAudio'

class DevErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="dev-viewport-placeholder">
          Dev Mode Error: {this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}

function DevLampStage() {
  const lighting = useLighting()
  const shadowSize = 256 + Math.round(lighting.shadowSoftness * 768)

  return (
    <>
      <color attach="background" args={['#090909']} />
      <ambientLight intensity={lighting.ambient} color="#d8d0c2" />
      <spotLight
        position={[0.1, 0.62, 0.38]}
        angle={0.55}
        penumbra={0.72}
        intensity={lighting.lampIntensity * 1.2}
        color="#ffd08a"
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color="#4c4034" roughness={0.62} metalness={0.02} />
      </mesh>
      <DevDeskLamp position={[0, 0, 0]} />
      <DevOrbitControls target={[0, 0.25, 0.12]} minDistance={0.18} maxDistance={1.5} />
    </>
  )
}

function DevScene({ activeTest }) {
  if (activeTest === 'monitor') return <DevStage2Monitor />
  if (activeTest === 'monitor20') return <DevStage2Monitor variant="front20" />
  if (activeTest === 'pc') return <DevStage1PC />
  if (activeTest === 'lamp') return <DevLampStage />
  if (activeTest === 'mouse') return <DevStageMouse />
  if (activeTest === 'keyboard') return <DevStageKeyboard />
  return <DevStage3Room />
}

function CameraPose({ config }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(...config.position)
    camera.fov = config.fov
    camera.near = config.near
    camera.far = config.far
    camera.updateProjectionMatrix()
  }, [camera, config])

  return null
}

function DevCanvas({ activeTest }) {
  const camera = useMemo(() => {
    if (activeTest === 'monitor') return { position: [0.56, 0.26, 0.86], fov: 45, near: 0.02, far: 20 }
    if (activeTest === 'monitor20') return { position: [0.50, 0.30, 0.82], fov: 42, near: 0.02, far: 20 }
    if (activeTest === 'pc') return { position: [0.45, 0.30, 0.62], fov: 48, near: 0.02, far: 20 }
    if (activeTest === 'lamp') return { position: [0.42, 0.34, 0.68], fov: 45, near: 0.02, far: 20 }
    if (activeTest === 'mouse') return { position: [0.20, 0.13, 0.32], fov: 42, near: 0.01, far: 20 }
    if (activeTest === 'keyboard') return { position: [0.28, 0.16, 0.34], fov: 42, near: 0.01, far: 20 }
    return { position: [1.15, 1.08, 1.55], fov: 47, near: 0.02, far: 30 }
  }, [activeTest])

  return (
    <Canvas
      dpr={[0.75, 1.25]}
      shadows
      camera={camera}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraPose config={camera} />
      <DevScene activeTest={activeTest} />
    </Canvas>
  )
}

export default function DeveloperMode({ onExit }) {
  const [activeTest, setActiveTest] = useState('scene')
  const [sceneReady, setSceneReady] = useState(false)

  const handleExit = useCallback(() => {
    stopAll()
    onExit?.()
  }, [onExit])

  useEffect(() => {
    const id = window.setTimeout(() => setSceneReady(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') handleExit()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleExit])

  return (
    <LightingProvider>
      <div className="dev-mode-root">
        <main className="dev-viewport" aria-label="Developer viewport">
          {!sceneReady && (
            <div className="dev-viewport-placeholder">
              DEV UI READY / SCENE QUEUED
            </div>
          )}
          {sceneReady && (
            <DevErrorBoundary>
              <DevCanvas activeTest={activeTest} />
            </DevErrorBoundary>
          )}
        </main>

        <DevModeUI
          activeTest={activeTest}
          onSelectTest={setActiveTest}
          onExit={handleExit}
          sceneReady={sceneReady}
        />
      </div>
    </LightingProvider>
  )
}
