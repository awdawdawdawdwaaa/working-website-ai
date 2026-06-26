import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import DeveloperRoom from './DeveloperRoom'
import DevOrbitControls from './DevOrbitControls'
import { getWarmLightColor, useLighting } from './LightingContext'

function ExposureController({ exposure }) {
  const { gl } = useThree()

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = exposure
  }, [exposure, gl])

  return null
}

function KeyboardFocusedLamp({ lighting, lampColor, shadowSize }) {
  const lightRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return
    lightRef.current.target = targetRef.current
    targetRef.current.updateMatrixWorld()
  }, [])

  return (
    <>
      <object3D ref={targetRef} position={[-0.04, 0.85, 0.340]} />
      <spotLight
        ref={lightRef}
        position={[-0.55, 1.22, 0.365]}
        angle={0.42}
        penumbra={0.76}
        intensity={lighting.lampIntensity * 0.70}
        distance={2.8}
        color={lampColor}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
      />
    </>
  )
}

export default function DevStage3Room() {
  const lighting = useLighting()
  const warm = getWarmLightColor(lighting.lampWarmth)
  const lampColor = new THREE.Color(warm.r, warm.g, warm.b)
  const shadowSize = 256 + Math.round(lighting.shadowSoftness * 768)

  return (
    <>
      <color attach="background" args={['#090909']} />
      <ExposureController exposure={lighting.exposure} />
      <ambientLight intensity={lighting.ambient} color="#ded4c4" />
      <pointLight
        position={[-0.55, 1.22, 0.365]}
        intensity={lighting.lampIntensity}
        distance={4.0}
        color={lampColor}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
      />
      <KeyboardFocusedLamp lighting={lighting} lampColor={lampColor} shadowSize={shadowSize} />
      <pointLight position={[0, 1.08, 0.25]} intensity={lighting.monitorGlow} distance={1.5} color="#8bdcff" />
      <pointLight position={[0.72, 1.08, 0.24]} intensity={lighting.caseLed * 0.16} distance={1.1} color="#ff3c25" />
      <DeveloperRoom
        bootStarted
        bootComplete
        dustOpacity={lighting.dustAmount}
        reflectionAmount={Math.max(0.15, lighting.monitorGlow + 0.45)}
        powered
      />
      <DevOrbitControls target={[0.10, 0.92, 0.10]} minDistance={0.38} maxDistance={4.2} />
    </>
  )
}
