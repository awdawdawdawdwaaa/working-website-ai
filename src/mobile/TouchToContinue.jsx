import { useEffect, useState } from 'react'

async function requestWakeLock() {
  try {
    const lock = await navigator.wakeLock?.request('screen')
    if (lock) {
      const restore = () => {
        if (document.visibilityState === 'visible') navigator.wakeLock?.request('screen')?.catch(() => {})
      }
      document.addEventListener('visibilitychange', restore)
      lock.addEventListener('release', () => document.removeEventListener('visibilitychange', restore))
    }
  } catch {}
}

export default function TouchToContinue({ onContinue }) {
  const [visible, setVisible] = useState(false)
  const [tapped, setTapped] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function handleTouch() {
    if (tapped) return
    setTapped(true)
    try { document.documentElement.requestFullscreen?.() } catch {}
    requestWakeLock()
    setTimeout(() => onContinue?.(), 400)
  }

  if (!visible && !tapped) return null

  return (
    <div
      onClick={handleTouch}
      onTouchStart={handleTouch}
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a',
        cursor: 'pointer',
        opacity: tapped ? 0 : 1,
        transition: 'opacity 0.35s ease',
        userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation',
      }}
    >
      <div style={{ width: 80, height: 100, position: 'relative', marginBottom: 28 }}>
        <svg viewBox="0 0 60 80" width="80" height="100" style={{
          animation: visible ? 'm-tap-hand 1.8s ease-in-out infinite' : 'none',
        }}>
          <path d="M30 50 V22 C30 19 28 17 26 17 C24 17 22 19 22 22 L22 43 L16 38 C13 36 10 35 8 37 C6 39 5 42 7 45 L17 56 C20 60 24 63 30 63 H38 C46 63 52 57 52 49 V28 C52 25 50 23 48 23 C46 23 44 25 44 28 V38"
            stroke="#e8c660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M30 50 V14 C30 12 28 10 26 10 C24 10 22 12 22 14 V22"
            stroke="#e8c660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="26" cy="8" r="4" fill="#e8c660" opacity="0.5">
            <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <p style={{ margin: 0, fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif', fontSize: 'clamp(1rem, 3.5vw, 1.15rem)', color: '#f5efe4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Tap to Continue
      </p>

      <p style={{ margin: '10px 0 0', fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#7a6e5a', letterSpacing: '0.04em', maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>
        Fullscreen mode will be enabled for the best experience
      </p>
    </div>
  )
}
