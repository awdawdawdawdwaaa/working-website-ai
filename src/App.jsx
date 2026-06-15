import { lazy, Suspense, useEffect, useState } from 'react'
import CinematicPortfolio from './core/CinematicPortfolio'

const MobileEntry = lazy(() => import('./mobile/MobileEntry'))

function isMobile() {
  return window.innerWidth < 1024 || window.innerHeight < 768
}

export default function App() {
  const [mobile, setMobile] = useState(null)

  useEffect(() => {
    setMobile(isMobile())
    const check = () => setMobile(isMobile())
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (mobile === null) return null

  if (mobile) {
    return (
      <Suspense fallback={null}>
        <MobileEntry />
      </Suspense>
    )
  }

  return <CinematicPortfolio />
}
