export default function MobileLoader({ phase, progress, statusText, onContinue, onTap }) {
  if (phase === 'warning') {
    return <WarningScreen onContinue={onContinue} />
  }
  if (phase === 'rotate') {
    return <RotateScreen />
  }
  if (phase === 'fullscreen') {
    return <FullscreenScreen onTap={onTap} />
  }
  if (phase === 'loading') {
    return <SnakeLoadingScreen progress={progress} statusText={statusText} />
  }
  return null
}

/* ─── SCREEN 1: WARNING — PC vs mobile ──────────────────── */
function WarningScreen({ onContinue }) {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 180, height: 130, position: 'relative', marginBottom: 32 }}>
          <svg viewBox="0 0 180 130" width="180" height="130" fill="none">
            <rect x="10" y="8" width="130" height="88" rx="4" stroke="#3a3428" strokeWidth="1.5" />
            <rect x="14" y="12" width="122" height="72" rx="2" fill="#12100e" />
            <rect x="14" y="12" width="122" height="72" rx="2" stroke="#1e1c18" strokeWidth="1" />
            <rect x="55" y="96" width="40" height="4" rx="2" fill="#3a3428" />
            <rect x="70" y="100" width="10" height="24" rx="1" fill="#2a2824" />
            <line x1="30" y1="30" x2="120" y2="30" stroke="#1e1c18" strokeWidth="1" />
            <line x1="30" y1="42" x2="100" y2="42" stroke="#1e1c18" strokeWidth="1" />
            <line x1="30" y1="54" x2="110" y2="54" stroke="#1e1c18" strokeWidth="1" />
            <rect x="60" y="24" width="28" height="12" rx="1" fill="#1a1814" stroke="#2a2824" strokeWidth="0.5" />
            <rect x="30" y="60" width="90" height="18" rx="1" fill="#1a1814" stroke="#2a2824" strokeWidth="0.5" />
            <rect x="120" y="16" width="8" height="4" rx="1" fill="#3a3428" />
            <rect x="130" y="70" width="6" height="6" rx="1" fill="#3a3428" />
            <rect x="130" y="80" width="6" height="6" rx="1" fill="#3a3428" />
            <line x1="132" y1="38" x2="132" y2="62" stroke="#3a3428" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="131" y="36" width="4" height="4" rx="1" fill="#3a3428" />
            <text x="155" y="52" fill="#3a3428" fontSize="7" fontFamily="monospace">WEB</text>
          </svg>

          <div style={{ position: 'absolute', bottom: 18, left: 138, width: 28, height: 44 }}>
            <svg viewBox="0 0 28 44" width="28" height="44" fill="none">
              <rect x="1" y="1" width="26" height="42" rx="6" stroke="#6a5e4a" strokeWidth="1" opacity="0.4" />
              <rect x="5" y="7" width="18" height="24" rx="1" fill="#12100e" opacity="0.3" />
              <circle cx="14" cy="36" r="2" stroke="#6a5e4a" strokeWidth="0.5" opacity="0.3" />
              <line x1="12" y1="35" x2="12" y2="37" stroke="#6a5e4a" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>

          <line x1="130" y1="10" x2="140" y2="10" stroke="#6a5e4a" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
          <line x1="130" y1="14" x2="140" y2="14" stroke="#6a5e4a" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
        </div>
        <p style={s.warningText}>
          This website was made for PC.<br />Mobile may experience lag, bugs, or reduced asset quality.
        </p>
        <p style={s.footer}>TME — Ved (CEO)</p>
        <button onClick={onContinue} style={s.btn}>Continue</button>
      </div>
    </div>
  )
}

/* ─── SCREEN 2: ROTATE — phone in hand ──────────────────── */
function RotateScreen() {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 170, height: 200, position: 'relative', marginBottom: 36 }}>
          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-hand-phone 2.8s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 170 200" width="170" height="200" fill="none">
              <path d="M40 170 Q30 160 35 140 L35 60 Q35 40 50 35 L120 35 Q135 40 135 60 L135 140 Q135 160 125 170"
                stroke="#3a3428" strokeWidth="2.5" fill="rgba(232,198,96,0.03)" />
              <rect x="48" y="42" width="74" height="120" rx="8" stroke="#e8c660" strokeWidth="1.5" opacity="0.8" />
              <rect x="56" y="58" width="58" height="80" rx="3" fill="rgba(232,198,96,0.04)" />
              <circle cx="85" cy="150" r="4" stroke="#e8c660" strokeWidth="1" opacity="0.5" />
              <line x1="72" y1="48" x2="98" y2="48" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>

          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-arc 2.8s ease-in-out infinite',
            transformOrigin: '85px 100px',
          }}>
            <svg viewBox="0 0 170 200" width="170" height="200" fill="none">
              <path d="M155 100 A70 70 0 0 1 20 130"
                stroke="#e8c660" strokeWidth="1.5" fill="none" opacity="0.5" />
              <polygon points="20,130 30,122 26,135" fill="#e8c660" opacity="0.6" />
            </svg>
          </div>

          <div style={{
            position: 'absolute', bottom: 20, right: 10, width: 28, height: 28,
            animation: 'm-lock-pulse 2.8s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <rect x="5" y="10" width="14" height="12" rx="2" stroke="#e8c660" strokeWidth="1.2" opacity="0.7" />
              <path d="M8 10 V7 C8 4 10 2 12 2 C14 2 16 4 16 7 V10"
                stroke="#e8c660" strokeWidth="1.2" fill="none" opacity="0.7" />
              <circle cx="12" cy="16" r="2" fill="#e8c660" opacity="0.5" />
            </svg>
          </div>
        </div>
        <p style={s.label}>Rotate your phone horizontally</p>
      </div>
    </div>
  )
}

/* ─── SCREEN 3: FULLSCREEN — phone with tap hand ──────────── */
function FullscreenScreen({ onTap }) {
  function handle(e) {
    e?.preventDefault()
    onTap()
  }

  return (
    <div
      onClick={handle}
      onTouchStart={handle}
      style={{ ...s.root, cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
    >
      <div className="m-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 130, height: 190, position: 'relative', marginBottom: 32 }}>
          <svg viewBox="0 0 130 190" width="130" height="190" fill="none">
            <rect x="6" y="4" width="118" height="182" rx="16" stroke="#f5efe4" strokeWidth="1.5" opacity="0.3" />
            <rect x="6" y="4" width="118" height="182" rx="16" fill="none" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <rect x="14" y="20" width="102" height="148" rx="4" fill="#0c0b0a" />
            <rect x="14" y="20" width="102" height="148" rx="4" stroke="#1e1c18" strokeWidth="1" />
            <line x1="26" y1="32" x2="104" y2="32" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="44" x2="90" y2="44" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="56" x2="96" y2="56" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="68" x2="86" y2="68" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="80" x2="100" y2="80" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="92" x2="74" y2="92" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="104" x2="104" y2="104" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="116" x2="92" y2="116" stroke="#1a1814" strokeWidth="0.8" />
            <line x1="26" y1="128" x2="60" y2="128" stroke="#1a1814" strokeWidth="0.8" />
            <rect x="42" y="134" width="46" height="28" rx="2" fill="#12100e" stroke="#1a1814" strokeWidth="0.5" />
            <rect x="60" y="28" width="22" height="18" rx="2" fill="#1a1814" stroke="#2a2824" strokeWidth="0.5" />
            <circle cx="65" cy="170" r="3" stroke="#3a3428" strokeWidth="0.8" />
            <line x1="56" y1="10" x2="74" y2="10" stroke="#f5efe4" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
          </svg>

          <div style={{
            position: 'absolute', top: 72, left: 48,
            animation: 'm-hand-tap 3s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 24 34" width="24" height="34" fill="none">
              <path d="M12 4 C8 6 5 10 5 16 C5 22 7 28 11 30 C12.5 31 13.5 31 15 30 C19 28 21 22 21 16 C21 10 18 6 14 4 C13 3.5 13 3.5 12 4Z"
                fill="#f5efe4" opacity="0.9" />
              <path d="M12 4 C8 6 5 10 5 16 C5 22 7 28 11 30 C12.5 31 13.5 31 15 30 C19 28 21 22 21 16 C21 10 18 6 14 4 C13 3.5 13 3.5 12 4Z"
                stroke="#e8c660" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>

          <div style={{
            position: 'absolute', top: 92, left: 56,
            animation: 'm-tap-ripple 3s ease-out infinite',
          }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#e8c660" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
        <p style={s.label}>Tap to Continue</p>
        <p style={s.sub}>Fullscreen mode will be enabled</p>
      </div>
    </div>
  )
}

/* ─── SCREEN 4: SNAKE LOADING ─────────────────────────── */
function SnakeLoadingScreen({ progress, statusText }) {
  const pct = Math.min(100, Math.max(0, Math.round((progress ?? 0) * 100)))
  const label = statusText || 'Loading…'

  return (
    <div style={s.root}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 48px', borderRadius: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(232,198,96,0.08)',
      }}>
        <div style={{ width: 100, height: 100, position: 'relative', marginBottom: 32 }}>
          <svg viewBox="0 0 100 100" width="100" height="100" className="m-snake-svg">
            <path id="snake-path"
              d="M 50 6 C 76 6, 94 24, 94 50 C 94 76, 76 94, 50 94 C 24 94, 6 76, 6 50 C 6 24, 24 6, 50 6"
              fill="none" stroke="#e8c660" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="m-snake-stroke"
            />
          </svg>
        </div>
        <div style={{
          width: 200, height: 2, background: 'rgba(232,198,96,0.08)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: '#e8c660', borderRadius: 2,
            width: `${pct}%`,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <p style={s.statusText}>{label}</p>
      </div>
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────── */
const s = {
  root: {
    position: 'fixed', inset: 0, zIndex: 999999,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#080808',
  },
  label: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.85rem, 3vw, 1rem)',
    color: '#f5efe4', letterSpacing: '0.12em',
    textTransform: 'uppercase', margin: 0,
  },
  sub: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
    color: '#6a5e4a', letterSpacing: '0.04em',
    marginTop: 12, textAlign: 'center', maxWidth: 280,
  },
  warningText: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)',
    color: '#c8bfae', lineHeight: 1.7, margin: 0,
    textAlign: 'center', maxWidth: 320,
  },
  footer: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.65rem', color: '#3a3428',
    letterSpacing: '0.08em', textAlign: 'center',
    marginTop: 32, marginBottom: 24,
  },
  btn: {
    display: 'block', margin: '0 auto',
    background: 'transparent',
    border: '1px solid #e8c660',
    borderRadius: 4,
    color: '#f5efe4',
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.8rem',
    padding: '10px 28px',
    cursor: 'pointer',
    letterSpacing: '0.06em',
  },
  statusText: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.7rem, 2.4vw, 0.8rem)',
    color: '#8a7d6a',
    letterSpacing: '0.05em',
    marginTop: 20,
    textAlign: 'center',
    minHeight: '1.4em',
  },
}
