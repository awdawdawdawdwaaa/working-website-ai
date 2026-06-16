import { lazy, Suspense, useEffect, useState } from 'react'
import CinematicPortfolio from './core/CinematicPortfolio'
import useDeviceProfile from './mobile/useDeviceProfile'

const MobileEntry = lazy(() => import('./mobile/MobileEntry'))

export default function App() {
  const { isMobile } = useDeviceProfile()

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <MobileEntry />
      </Suspense>
    )
  }

  return <CinematicPortfolio />
}
