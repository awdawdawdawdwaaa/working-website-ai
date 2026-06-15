import { Suspense } from 'react'
import CameraRig          from '../core/CameraRig'
import LightingRig        from '../core/LightingRig'
import SingleLightLine    from '../core/SingleLightLine'
import PcRoomLine         from '../core/RoomLine/PcRoomLine'
import CharacterController from '../animations/CharacterController'
import WorldGeometry      from './WorldGeometry'
import PropLoader         from './PropLoader'
import useLineVisibilityGate from '../loading/useLineVisibilityGate'

export default function ScrollCinematicFlow({ progress }) {
  const loaderLineActive = useLineVisibilityGate()

  return (
    <>
      <CameraRig progress={progress} />
      <LightingRig progress={progress} />
      <Suspense fallback={null}>
        <WorldGeometry progress={progress} />
        <PropLoader />
        <CharacterController progress={progress} />
      </Suspense>
      <SingleLightLine progress={progress} loaderLineActive={loaderLineActive} />
      <PcRoomLine progress={progress} />
      <fog attach="fog" args={['#100f0e', 32, 68]} />
    </>
  )
}
