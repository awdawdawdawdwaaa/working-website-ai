import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function DevOrbitControls({
  target = [0, 0.85, 0],
  minDistance = 0.12,
  maxDistance = 5.5,
}) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const preventMenu = (event) => event.preventDefault()
    canvas.addEventListener('contextmenu', preventMenu)
    return () => canvas.removeEventListener('contextmenu', preventMenu)
  }, [gl])

  return (
    <OrbitControls
      makeDefault
      target={target}
      enableDamping
      dampingFactor={0.08}
      enablePan
      screenSpacePanning
      panSpeed={0.65}
      rotateSpeed={0.62}
      zoomSpeed={0.72}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
    />
  )
}
