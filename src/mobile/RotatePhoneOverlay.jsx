import { useEffect, useState } from 'react'

function isLandscape() {
  if (window.screen?.orientation?.angle != null) {
    const a = window.screen.orientation.angle
    if (a === 90 || a === -90) return true
    if (a === 0 || a === 180) return false
  }
  if (window.orientation != null) {
    return window.orientation === 90 || window.orientation === -90
  }
  return window.innerWidth > window.innerHeight
}

export default function RotatePhoneGate({ onDismiss }) {
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  function dismiss() {
    setFading(true)
    setTimeout(() => { setGone(true); onDismiss?.() }, 400)
  }

  useEffect(() => {
    let timer = setTimeout(() => dismiss(), 4000)
    function check() {
      if (isLandscape()) { clearTimeout(timer); dismiss() }
    }
    check()
    window.addEventListener('orientationchange', check)
    window.addEventListener('resize', check)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('orientationchange', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  if (gone) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <div style={{ width: 140, height: 200, position: 'relative', marginBottom: 40 }}>
        <svg viewBox="0 0 140 200" width="140" height="200" style={{
          animation: 'm-rotate-phone 2.4s ease-in-out infinite',
        }}>
          <rect x="10" y="5" width="120" height="190" rx="18" stroke="#e8c660" strokeWidth="2.5" fill="none" />
          <rect x="25" y="28" width="90" height="130" rx="4" fill="rgba(232,198,96,0.06)" />
          <line x1="42" y1="16" x2="98" y2="16" stroke="#e8c660" strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="175" r="8" stroke="#e8c660" strokeWidth="2" fill="none" />
        </svg>

        <svg viewBox="0 0 140 200" width="140" height="200" style={{
          position: 'absolute', inset: 0,
          animation: 'm-rotate-arrow 2.4s ease-in-out infinite',
        }}>
          <path d="M130 60 A80 80 0 0 1 70 170" stroke="#e8c660" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <polygon points="70,170 76,158 64,158" fill="#e8c660" />
        </svg>
      </div>

      <p style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif', fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: '#f5efe4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
        Rotate Device
      </p>

      <p style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#7a6e5a', letterSpacing: '0.04em', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
        Please rotate your phone to landscape<br />for the best viewing experience
      </p>
    </div>
  )
}
