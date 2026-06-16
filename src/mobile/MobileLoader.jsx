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

/* ─── SCREEN 1: WARNING ───────────────────────────────── */
function WarningScreen({ onContinue }) {
  return (
    <div style={s.root}>
      <div className="m-fade-in">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="#e8c660" strokeWidth="1.5" style={{ marginBottom: 24, display: 'block', margin: '0 auto 24px' }}>
          <circle cx="16" cy="16" r="12" />
          <path d="M12 20 L20 12 M12 12 L20 20" />
        </svg>
        <p style={s.warningText}>
          This website was made for PC.<br />Mobile may experience lag, bugs, or reduced asset quality.
        </p>
        <p style={s.footer}>TME — Ved (CEO)</p>
        <button onClick={onContinue} style={s.btn}>Continue</button>
      </div>
    </div>
  )
}

/* ─── SCREEN 2: ROTATE ────────────────────────────────── */
function RotateScreen() {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 130, height: 190, position: 'relative', marginBottom: 36 }}>
          <svg viewBox="0 0 130 190" width="130" height="190"
            style={{ animation: 'm-rotate-phone 2.4s ease-in-out infinite' }}>
            <rect x="8" y="4" width="114" height="182" rx="16" stroke="#e8c660" strokeWidth="2.5" fill="none" />
            <rect x="22" y="26" width="86" height="125" rx="4" fill="rgba(232,198,96,0.06)" />
            <line x1="38" y1="14" x2="92" y2="14" stroke="#e8c660" strokeWidth="3" strokeLinecap="round" />
            <circle cx="65" cy="167" r="7" stroke="#e8c660" strokeWidth="2" fill="none" />
          </svg>
          <svg viewBox="0 0 130 190" width="130" height="190"
            style={{ position: 'absolute', inset: 0, animation: 'm-rotate-arrow 2.4s ease-in-out infinite' }}>
            <path d="M120 55 A75 75 0 0 1 65 165" stroke="#e8c660" strokeWidth="2" fill="none" strokeDasharray="5 4" />
            <polygon points="65,165 71,153 59,153" fill="#e8c660" />
          </svg>
        </div>
        <p style={s.label}>Rotate your phone horizontally</p>
      </div>
    </div>
  )
}

/* ─── SCREEN 3: FULLSCREEN ────────────────────────────── */
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
        <div style={{ width: 64, height: 100, marginBottom: 12 }}>
          <svg viewBox="0 0 40 64" width="64" height="100" fill="none">
            <rect x="4" y="2" width="32" height="60" rx="6" stroke="#e8c660" strokeWidth="2" />
            <rect x="10" y="10" width="20" height="30" rx="2" fill="rgba(232,198,96,0.06)" />
            <line x1="12" y1="7" x2="28" y2="7" stroke="#e8c660" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="m-arrow-down" />
        <div style={{ width: 56, height: 72, margin: '8px 0' }}>
          <svg viewBox="0 0 40 52" width="56" height="72" fill="none">
            <path d="M20 36 V14 C20 11 18 9 16 9 C14 9 12 11 12 14 L12 30 L8 26 C6 24 4 23 3 25 C2 27 2 29 4 31 L12 39 C14 42 17 44 22 44 H28 C34 44 38 40 38 34 V18 C38 15 36 13 34 13 C32 13 30 15 30 18 V26"
              stroke="#e8c660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 36 V8 C20 6 18 4 16 4 C14 4 12 6 12 8 V14"
              stroke="#e8c660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="3" r="3" fill="#e8c660" opacity="0.5">
              <animate attributeName="r" values="3;6;3" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <div className="m-arrow-down" />
        <div style={{ width: 48, height: 48, margin: '8px 0 28px' }}>
          <svg viewBox="0 0 40 40" width="48" height="48" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="4" stroke="#e8c660" strokeWidth="2" />
            <path d="M8 8 L16 16 M16 8 L8 16" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 8 L24 16 M24 8 L32 16" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 32 L16 24 M16 32 L8 24" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 32 L24 24 M24 32 L32 24" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ ...s.label, writingMode: 'horizontal-tb' }}>Tap to Continue</p>
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
      <div style={{ width: 120, height: 120, position: 'relative', marginBottom: 40 }}>
        <svg viewBox="0 0 100 100" width="120" height="120" className="m-snake-svg">
          <path id="snake-path"
            d="M 50 6 C 76 6, 94 24, 94 50 C 94 76, 76 94, 50 94 C 24 94, 6 76, 6 50 C 6 24, 24 6, 50 6"
            fill="none" stroke="#e8c660" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            className="m-snake-stroke"
          />
        </svg>
      </div>
      <div style={{ width: 200, height: 2, background: '#1e1c18', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#e8c660', borderRadius: 2,
          width: `${pct}%`,
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      <p style={s.statusText}>{label}</p>
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
