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

/* ─── SCREEN 1: WARNING — desktop vs mobile ───────────── */
function WarningScreen({ onContinue }) {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(100px, 30vw, 160px)', height: 'clamp(80px, 24vw, 120px)', marginBottom: 'clamp(20px, 4vh, 36px)' }}>
          <svg viewBox="0 0 160 120" width="100%" height="100%" fill="none">
            <rect x="8" y="6" width="110" height="78" rx="4" stroke="#e8c660" strokeWidth="1.2" opacity="0.5" />
            <rect x="12" y="10" width="102" height="64" rx="2" fill="rgba(232,198,96,0.03)" />
            <rect x="12" y="10" width="102" height="64" rx="2" stroke="#e8c660" strokeWidth="0.3" opacity="0.2" />
            <rect x="46" y="84" width="34" height="4" rx="2" stroke="#e8c660" strokeWidth="0.6" opacity="0.3" />
            <rect x="60" y="88" width="8" height="22" rx="1" stroke="#e8c660" strokeWidth="0.5" opacity="0.25" />
            <line x1="24" y1="24" x2="102" y2="24" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="24" y1="34" x2="86" y2="34" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="24" y1="44" x2="94" y2="44" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="24" y1="54" x2="78" y2="54" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <rect x="116" y="42" width="36" height="8" rx="2" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="124" y1="46" x2="144" y2="46" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="124" y1="52" x2="138" y2="52" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <line x1="116" y1="36" x2="116" y2="42" stroke="#e8c660" strokeWidth="0.5" opacity="0.12" />
            <line x1="152" y1="36" x2="152" y2="42" stroke="#e8c660" strokeWidth="0.5" opacity="0.12" />
            <rect x="130" y="55" width="12" height="16" rx="6" stroke="#e8c660" strokeWidth="0.5" opacity="0.15" />
            <rect x="133" y="59" width="6" height="8" rx="1" fill="rgba(232,198,96,0.05)" />
          </svg>
        </div>
        <p style={{ ...s.warningText, color: '#f5efe4' }}>
          This website was made for PC.<br />Mobile may experience lag, bugs, or reduced asset quality.
        </p>
        <p style={s.footer}>TME — Ved (CEO)</p>
        <button onClick={onContinue} style={s.btn}>Continue</button>
      </div>
    </div>
  )
}

/* ─── SCREEN 2: ROTATE — minimal phone rotation ────────── */
function RotateScreen() {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(90px, 28vw, 150px)', height: 'clamp(130px, 38vw, 200px)', position: 'relative', marginBottom: 'clamp(20px, 4vh, 36px)' }}>
          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-phone 2.4s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
              <rect x="12" y="5" width="76" height="140" rx="12" stroke="#e8c660" strokeWidth="1.5" opacity="0.6" />
              <rect x="20" y="24" width="60" height="96" rx="3" fill="rgba(232,198,96,0.02)" stroke="#e8c660" strokeWidth="0.3" opacity="0.2" />
              <circle cx="50" cy="136" r="4" stroke="#e8c660" strokeWidth="0.8" opacity="0.3" />
              <line x1="38" y1="14" x2="62" y2="14" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <line x1="26" y1="32" x2="74" y2="32" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="44" x2="60" y2="44" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="56" x2="70" y2="56" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="68" x2="54" y2="68" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="80" x2="66" y2="80" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="92" x2="58" y2="92" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="104" x2="72" y2="104" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
              <line x1="26" y1="112" x2="50" y2="112" stroke="#e8c660" strokeWidth="0.4" opacity="0.12" />
            </svg>
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-arc 2.4s ease-in-out infinite',
            transformOrigin: '50% 50%',
          }}>
            <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
              <path d="M90 60 C95 70 96 85 90 95 C84 105 72 112 60 115"
                stroke="#e8c660" strokeWidth="1.2" fill="none" opacity="0.4" />
              <polygon points="60,115 68,108 66,120" fill="#e8c660" opacity="0.5" />
            </svg>
          </div>
        </div>
        <p style={s.label}>Rotate your phone horizontally</p>
      </div>
    </div>
  )
}

/* ─── SCREEN 3: FULLSCREEN — realistic touch animation ──── */
function FullscreenScreen({ onTap }) {
  function handle(e) {
    e?.preventDefault()
    onTap()
  }

  const RING = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '1.2px solid #e8c660',
    opacity: 0,
  }

  return (
    <div
      onClick={handle}
      onTouchStart={handle}
      style={{ ...s.root, cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
    >
      <div className="m-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(80px, 26vw, 130px)', height: 'clamp(120px, 36vw, 190px)', position: 'relative', marginBottom: 'clamp(16px, 3vh, 28px)' }}>
          <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
            <rect x="8" y="3" width="84" height="144" rx="14" stroke="#e8c660" strokeWidth="1.2" opacity="0.5" />
            <rect x="16" y="18" width="68" height="116" rx="3" fill="rgba(232,198,96,0.02)" stroke="#e8c660" strokeWidth="0.3" opacity="0.15" />
            <line x1="24" y1="28" x2="76" y2="28" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="38" x2="66" y2="38" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="52" x2="72" y2="52" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="66" x2="60" y2="66" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="80" x2="74" y2="80" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="94" x2="56" y2="94" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <line x1="24" y1="108" x2="68" y2="108" stroke="#e8c660" strokeWidth="0.4" opacity="0.1" />
            <circle cx="50" cy="130" r="3" stroke="#e8c660" strokeWidth="0.6" opacity="0.25" />
            <line x1="40" y1="11" x2="60" y2="11" stroke="#e8c660" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
          </svg>

          <div style={{
            position: 'absolute', top: '17%', left: '23%', right: '23%', bottom: '22%',
            borderRadius: 3, overflow: 'hidden', pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 45%, #e8c660 0%, transparent 70%)',
              animation: 'm-screen-flash 4s ease-in-out infinite',
            }} />
          </div>

          <div style={{
            position: 'absolute', top: '36%', left: '50%',
            transform: 'translateX(-50%)',
            animation: 'm-hand-tap 4s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 26 38" width="22" height="32" fill="none">
              <path d="M13 2 C9 3 6 7 5 13 C4 18 5 23 8 27 C10 29.5 12 30.5 14 30 C17 28 20 24 21 18 C22 12 20 5 16 2 Z"
                fill="#f5efe4" opacity="0.88" />
              <path d="M20 19 Q19 24 17 27" stroke="#e8c660" strokeWidth="0.5" fill="none" opacity="0.35" />
            </svg>
          </div>

          <div style={{ ...RING, width: 16, height: 16, animation: 'm-tap-ring 4s ease-out infinite' }} />
          <div style={{ ...RING, width: 22, height: 22, animation: 'm-tap-ring 4s ease-out 0.12s infinite' }} />
          <div style={{ ...RING, width: 30, height: 30, animation: 'm-tap-ring 4s ease-out 0.24s infinite' }} />
        </div>
        <p style={{ ...s.label, color: '#f5efe4' }}>Tap to Continue</p>
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
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
        maxWidth: 360, padding: '0 24px',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'clamp(24px, 5vw, 36px) clamp(32px, 8vw, 48px)',
          borderRadius: 16, width: '100%', maxWidth: 280,
          border: '1px solid rgba(232,198,96,0.1)',
        }}>
          <div style={{ width: 'clamp(60px, 20vw, 90px)', height: 'clamp(60px, 20vw, 90px)', position: 'relative', marginBottom: 'clamp(20px, 3vh, 28px)' }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" className="m-snake-svg">
              <path id="snake-path"
                d="M 50 6 C 76 6, 94 24, 94 50 C 94 76, 76 94, 50 94 C 24 94, 6 76, 6 50 C 6 24, 24 6, 50 6"
                fill="none" stroke="#e8c660" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="m-snake-stroke"
              />
            </svg>
          </div>
          <div style={{
            width: '100%', maxWidth: 180, height: 2,
            borderRadius: 2, overflow: 'hidden',
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
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────── */
const YELLOW = '#e8c660'
const WHITE = '#f5efe4'

const s = {
  root: {
    position: 'fixed', inset: 0, zIndex: 999999,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#080808',
    height: '100dvh',
  },
  label: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.75rem, 2.8vw, 1rem)',
    color: WHITE, letterSpacing: '0.12em',
    textTransform: 'uppercase', margin: 0,
    textAlign: 'center',
  },
  sub: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.55rem, 2vw, 0.75rem)',
    color: YELLOW, letterSpacing: '0.06em',
    marginTop: 'clamp(8px, 1.5vh, 14px)',
    textAlign: 'center', maxWidth: 280,
    opacity: 0.7,
  },
  warningText: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.7rem, 2.6vw, 0.9rem)',
    color: '#c8bfae', lineHeight: 1.7, margin: 0,
    textAlign: 'center', maxWidth: 320,
  },
  footer: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.6rem',
    color: YELLOW, letterSpacing: '0.08em',
    textAlign: 'center',
    marginTop: 'clamp(20px, 4vh, 32px)',
    marginBottom: 'clamp(16px, 3vh, 24px)',
    opacity: 0.5,
  },
  btn: {
    display: 'block', margin: '0 auto',
    background: 'transparent',
    border: `1px solid ${YELLOW}`,
    borderRadius: 4,
    color: WHITE,
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.7rem, 2.4vw, 0.8rem)',
    padding: 'clamp(8px, 1.5vh, 12px) clamp(20px, 5vw, 32px)',
    cursor: 'pointer',
    letterSpacing: '0.06em',
  },
  statusText: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.6rem, 2.2vw, 0.75rem)',
    color: YELLOW, letterSpacing: '0.05em',
    marginTop: 'clamp(12px, 2vh, 20px)',
    textAlign: 'center',
    minHeight: '1.2em',
    opacity: 0.6,
  },
}
