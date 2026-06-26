import { lazy, Suspense, useState, useCallback } from 'react'
import CinematicPortfolio from './core/CinematicPortfolio'
import useDeviceProfile from './mobile/useDeviceProfile'
import DeveloperMode from './developer/DeveloperMode'

const MobileEntry = lazy(() => import('./mobile/MobileEntry'))

export default function App() {
  const { isMobile } = useDeviceProfile()
  const [devMode, setDevMode] = useState(false)

  const handleExit = useCallback(() => setDevMode(false), [])

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <MobileEntry />
      </Suspense>
    )
  }

  if (devMode) {
    return <DeveloperMode onExit={handleExit} />
  }

  return (
    <>
      <CinematicPortfolio />
      <button
        onClick={() => setDevMode(true)}
        title="Developer Mode"
        style={{
          position: 'fixed', bottom: 10, right: 10, zIndex: 9999,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 3, color: 'rgba(255,255,255,0.18)',
          fontFamily: 'monospace', fontSize: '0.45rem',
          padding: '3px 7px', cursor: 'pointer',
          letterSpacing: '0.08em',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transition: 'color 0.3s, border-color 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'rgba(232,198,96,0.6)'
          e.currentTarget.style.borderColor = 'rgba(232,198,96,0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.18)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        }}
      >
        [ Dev Mode ]
      </button>
    </>
  )
}
