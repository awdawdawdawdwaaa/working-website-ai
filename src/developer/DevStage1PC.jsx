import { useCallback, useState } from 'react'
import DevOrbitControls from './DevOrbitControls'
import RetroPC from './RetroPC'
import { useLighting } from './LightingContext'

export default function DevStage1PC({ onComplete }) {
  const [powered, setPowered] = useState(false)
  const lighting = useLighting()

  const handlePowerOn = useCallback(() => {
    setPowered(true)
    window.setTimeout(() => onComplete?.(), 1200)
  }, [onComplete])

  return (
    <>
      <color attach="background" args={['#090909']} />
      <ambientLight intensity={lighting.ambient + 0.035} color="#d7cec0" />
      <pointLight position={[0.45, 0.70, 0.70]} intensity={1.0 + lighting.lampIntensity * 0.18} distance={2.6} color="#ffd39b" castShadow />
      <pointLight position={[0.18, -0.06, 0.36]} intensity={powered ? lighting.caseLed * 0.35 : 0.02} distance={0.8} color="#ff3822" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.262, 0]} receiveShadow>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial color="#4b4034" roughness={0.66} metalness={0.02} />
      </mesh>
      <RetroPC position={[0, 0, 0]} onPowerOn={handlePowerOn} powerEnabled={!powered} powered={powered} />
      <DevOrbitControls target={[0, 0, 0.02]} minDistance={0.22} maxDistance={1.8} />
    </>
  )
}
