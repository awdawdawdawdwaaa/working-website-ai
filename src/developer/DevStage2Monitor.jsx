import { useEffect, useRef } from 'react'
import DevCRT from './DevCRT'
import DevCRT20 from './DevCRT20'
import DevOrbitControls from './DevOrbitControls'
import { startMonitorHum, stopMonitorHum } from './DevAudio'
import { useLighting } from './LightingContext'

export default function DevStage2Monitor({ onComplete, variant = 'classic' }) {
  const doneRef = useRef(false)
  const lighting = useLighting()
  const shadowSize = 256 + Math.round(lighting.shadowSoftness * 768)
  const isVersion2 = variant === 'front20'

  const handleBootComplete = () => {
    if (doneRef.current) return
    doneRef.current = true
    window.setTimeout(() => onComplete?.(), 1200)
  }

  useEffect(() => {
    startMonitorHum()
    return () => stopMonitorHum()
  }, [])

  return (
    <>
      <color attach="background" args={['#090909']} />
      <ambientLight intensity={lighting.ambient + 0.015} color="#d8d0c2" />
      <pointLight
        position={[0.52, 0.82, 0.65]}
        intensity={lighting.lampIntensity * 0.55 + 0.42}
        distance={2.8}
        color="#ffd096"
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
      />
      <pointLight position={[0, 0.34, 0.24]} intensity={lighting.monitorGlow + 0.08} distance={1.4} color="#8bdcff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.2]} />
        <meshStandardMaterial color="#4a4034" roughness={0.66} metalness={0.02} />
      </mesh>
      {isVersion2 ? (
        <DevCRT20 position={[0, 0, 0]} boot bootComplete={false} onBootComplete={handleBootComplete} reflectionAmount={0.72} />
      ) : (
        <DevCRT position={[0, 0, 0]} boot bootComplete={false} onBootComplete={handleBootComplete} reflectionAmount={0.72} />
      )}
      <DevOrbitControls target={isVersion2 ? [0, 0.30, 0.08] : [0, 0.32, 0.02]} minDistance={0.28} maxDistance={1.9} />
    </>
  )
}
