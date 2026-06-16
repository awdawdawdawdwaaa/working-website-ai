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

const W = '#f5efe4'
const Y = '#e8c660'
const HW = '"Georgia", "Palatino Linotype", "Book Antiqua", Palatino, serif'

/* ─── SCREEN 1: WARNING — PC illustration ─────────────── */
function WarningScreen({ onContinue }) {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(100px, 30vw, 170px)', height: 'clamp(80px, 22vw, 120px)', position: 'relative', marginBottom: 'clamp(24px, 5vh, 40px)' }}>
          <svg viewBox="0 0 180 130" width="100%" height="100%" fill="none">
            <rect x="10" y="6" width="130" height="86" rx="6" stroke={W} strokeWidth="1" opacity="0.85" />
            <rect x="16" y="12" width="118" height="74" rx="2" fill="rgba(245,239,228,0.015)" />
            <rect x="16" y="12" width="118" height="74" rx="2" stroke={W} strokeWidth="0.3" opacity="0.12" />
            <rect x="60" y="92" width="30" height="4" rx="2" stroke={W} strokeWidth="0.8" opacity="0.5" />
            <rect x="73" y="96" width="6" height="18" rx="1" stroke={W} strokeWidth="0.8" opacity="0.5" />
            <rect x="56" y="112" width="40" height="3" rx="1.5" stroke={W} strokeWidth="0.6" opacity="0.35" />
            <line x1="28" y1="26" x2="120" y2="26" stroke={W} strokeWidth="0.3" opacity="0.12" />
            <line x1="28" y1="40" x2="105" y2="40" stroke={W} strokeWidth="0.3" opacity="0.12" />
            <line x1="28" y1="54" x2="112" y2="54" stroke={W} strokeWidth="0.3" opacity="0.12" />
            <line x1="28" y1="68" x2="95" y2="68" stroke={W} strokeWidth="0.3" opacity="0.12" />
            <rect x="80" y="22" width="28" height="12" rx="2" stroke={W} strokeWidth="0.4" opacity="0.2" />
            <line x1="86" y1="28" x2="102" y2="28" stroke={W} strokeWidth="0.3" opacity="0.15" />
          </svg>
          <div style={{
            position: 'absolute', top: '9%', left: '9%', right: '9%', bottom: '32%',
            borderRadius: 2, overflow: 'hidden', pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 40%, #e8c660 0%, transparent 70%)',
              animation: 'm-monitor-glow 4s ease-in-out infinite',
            }} />
          </div>
        </div>
        <p style={s.main}>This website was made for PC</p>
        <p style={s.sub}>Mobile may experience lag and 3D model quality may be reduced.</p>
        <p style={s.footer}>TME — Ved (CEO)</p>
        <button onClick={onContinue} style={s.btn}>Continue</button>
      </div>
    </div>
  )
}

/* ─── SCREEN 2: ROTATE — phone rotation ───────────────── */
function RotateScreen() {
  return (
    <div style={s.root}>
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(80px, 26vw, 140px)', height: 'clamp(120px, 36vw, 190px)', position: 'relative', marginBottom: 'clamp(24px, 5vh, 40px)' }}>
          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-phone 2.8s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
              <rect x="14" y="5" width="72" height="140" rx="14" stroke={W} strokeWidth="1" opacity="0.8" />
              <rect x="22" y="24" width="56" height="96" rx="4" fill="rgba(245,239,228,0.012)" />
              <rect x="22" y="24" width="56" height="96" rx="4" stroke={W} strokeWidth="0.25" opacity="0.1" />
              <circle cx="50" cy="136" r="3.5" stroke={W} strokeWidth="0.6" opacity="0.3" />
              <line x1="38" y1="14" x2="62" y2="14" stroke={W} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              <line x1="30" y1="34" x2="70" y2="34" stroke={W} strokeWidth="0.3" opacity="0.1" />
              <line x1="30" y1="48" x2="58" y2="48" stroke={W} strokeWidth="0.3" opacity="0.1" />
              <line x1="30" y1="62" x2="66" y2="62" stroke={W} strokeWidth="0.3" opacity="0.1" />
              <line x1="30" y1="76" x2="54" y2="76" stroke={W} strokeWidth="0.3" opacity="0.1" />
              <line x1="30" y1="90" x2="64" y2="90" stroke={W} strokeWidth="0.3" opacity="0.1" />
              <line x1="30" y1="104" x2="56" y2="104" stroke={W} strokeWidth="0.3" opacity="0.1" />
            </svg>
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            animation: 'm-rotate-arc 2.8s ease-in-out infinite',
            transformOrigin: '50% 50%',
          }}>
            <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
              <path d="M90 55 C96 68 96 85 88 98 C82 108 70 116 58 119"
                stroke={Y} strokeWidth="1" fill="none" opacity="0.45" />
              <polygon points="58,119 66,113 64,126" fill={Y} opacity="0.55" />
            </svg>
          </div>
        </div>
        <p style={s.main}>Rotate your phone</p>
        <p style={s.sub}>Hold device horizontally for best experience</p>
      </div>
    </div>
  )
}

/* ─── SCREEN 3: FULLSCREEN — tap with finger + ripple ── */
function FullscreenScreen({ onTap }) {
  function handle(e) {
    e?.preventDefault()
    onTap()
  }

  const RING = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '1px solid #e8c660',
    opacity: 0,
  }

  return (
    <div
      onClick={handle}
      onTouchStart={handle}
      style={{ ...s.root, cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
    >
      <div className="m-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ width: 'clamp(75px, 24vw, 125px)', height: 'clamp(110px, 34vw, 180px)', position: 'relative', marginBottom: 'clamp(20px, 4vh, 32px)' }}>
          <svg viewBox="0 0 100 150" width="100%" height="100%" fill="none">
            <rect x="10" y="4" width="80" height="142" rx="16" stroke={W} strokeWidth="1" opacity="0.8" />
            <rect x="18" y="20" width="64" height="112" rx="4" fill="rgba(245,239,228,0.012)" />
            <rect x="18" y="20" width="64" height="112" rx="4" stroke={W} strokeWidth="0.25" opacity="0.1" />
            <circle cx="50" cy="146" r="3" stroke={W} strokeWidth="0.5" opacity="0.25" />
            <line x1="38" y1="12" x2="62" y2="12" stroke={W} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
            <line x1="26" y1="30" x2="74" y2="30" stroke={W} strokeWidth="0.3" opacity="0.08" />
            <line x1="26" y1="46" x2="62" y2="46" stroke={W} strokeWidth="0.3" opacity="0.08" />
            <line x1="26" y1="62" x2="70" y2="62" stroke={W} strokeWidth="0.3" opacity="0.08" />
            <line x1="26" y1="78" x2="56" y2="78" stroke={W} strokeWidth="0.3" opacity="0.08" />
            <line x1="26" y1="94" x2="66" y2="94" stroke={W} strokeWidth="0.3" opacity="0.08" />
            <line x1="26" y1="110" x2="58" y2="110" stroke={W} strokeWidth="0.3" opacity="0.08" />
          </svg>

          <div style={{
            position: 'absolute', top: '36%', left: '50%',
            transform: 'translateX(-50%)',
            animation: 'm-hand-tap 4s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 24 34" width="20" height="28" fill="none">
              <path d="M12 2 C8 3 5 7 5 12 C4 17 5 22 8 26 C10 28 11.5 29 13 29 C14.5 29 16 28 18 26 C21 22 22 17 22 12 C22 7 19 3 15 2 C14 1.5 14 2 12 2Z"
                fill={W} opacity="0.85" />
              <path d="M19.5 17 Q18.5 22 16.5 25" stroke={Y} strokeWidth="0.4" fill="none" opacity="0.35" />
            </svg>
          </div>

          <div style={{ ...RING, width: 14, height: 14, animation: 'm-tap-ring 4s ease-out infinite' }} />
          <div style={{ ...RING, width: 20, height: 20, animation: 'm-tap-ring 4s ease-out 0.12s infinite' }} />
          <div style={{ ...RING, width: 28, height: 28, animation: 'm-tap-ring 4s ease-out 0.24s infinite' }} />
        </div>
        <p style={s.main}>Tap to Continue</p>
        <p style={s.sub}>Enter fullscreen mode for best experience</p>
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
      <div className="m-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'clamp(28px, 5vw, 40px) clamp(36px, 8vw, 52px)',
          borderRadius: 16, width: '100%', maxWidth: 280,
          border: '1px solid rgba(245,239,228,0.08)',
        }}>
          <div style={{ width: 'clamp(56px, 18vw, 80px)', height: 'clamp(56px, 18vw, 80px)', position: 'relative', marginBottom: 'clamp(20px, 3vh, 28px)' }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" className="m-snake-svg">
              <path id="snake-path"
                d="M 50 6 C 76 6, 94 24, 94 50 C 94 76, 76 94, 50 94 C 24 94, 6 76, 6 50 C 6 24, 24 6, 50 6"
                fill="none" stroke={Y} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
                className="m-snake-stroke"
              />
            </svg>
          </div>
          <div style={{
            width: '100%', maxWidth: 180, height: 2,
            borderRadius: 2, overflow: 'hidden',
            background: 'rgba(245,239,228,0.06)',
          }}>
            <div style={{
              height: '100%', background: Y, borderRadius: 2,
              width: `${pct}%`,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          <p style={s.loadingText}>{label}</p>
        </div>
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
    height: '100dvh',
  },
  main: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.95rem, 3.4vw, 1.25rem)',
    fontWeight: 700,
    color: W, letterSpacing: '0.02em',
    margin: 0, textAlign: 'center',
  },
  sub: {
    fontFamily: HW,
    fontStyle: 'italic',
    fontSize: 'clamp(0.6rem, 2.2vw, 0.8rem)',
    color: Y, letterSpacing: '0.04em',
    marginTop: 'clamp(10px, 2vh, 18px)',
    textAlign: 'center', maxWidth: 300,
    lineHeight: 1.5,
    opacity: 0.8,
  },
  footer: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.6rem',
    color: Y, letterSpacing: '0.08em',
    textAlign: 'center',
    marginTop: 'clamp(24px, 4vh, 36px)',
    marginBottom: 'clamp(14px, 2.5vh, 22px)',
    opacity: 0.5,
  },
  btn: {
    display: 'block', margin: '0 auto',
    background: 'transparent',
    border: `1px solid ${W}`,
    borderRadius: 4,
    color: W,
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.7rem, 2.4vw, 0.8rem)',
    padding: 'clamp(8px, 1.5vh, 12px) clamp(22px, 5vw, 34px)',
    cursor: 'pointer',
    letterSpacing: '0.06em',
  },
  loadingText: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontSize: 'clamp(0.65rem, 2.2vw, 0.8rem)',
    color: W, letterSpacing: '0.05em',
    marginTop: 'clamp(14px, 2vh, 22px)',
    textAlign: 'center',
    minHeight: '1.2em',
    opacity: 0.75,
  },
}
