export default function MobileLoader({ phase, progress, assetHint, onTapContinue, onWarningContinue }) {

  // ─── ROTATE PHONE ─────────────────────────────────────────
  if (phase === 'rotate') {
    return <RotateScreen />
  }

  // ─── LOADING ──────────────────────────────────────────────
  if (phase === 'loading') {
    return <LoadingScreen progress={progress} assetHint={assetHint} />
  }

  // ─── TAP TO CONTINUE ──────────────────────────────────────
  if (phase === 'tap') {
    return <TapScreen onTap={onTapContinue} />
  }

  // ─── WARNING ──────────────────────────────────────────────
  if (phase === 'warning') {
    return <WarningScreen onContinue={onWarningContinue} />
  }

  return null
}

/* ─── ROTATE PHONE ─────────────────────────────────────── */
function RotateScreen() {
  return (
    <div style={s.root}>
      <div style={{ width: 140, height: 200, position: 'relative', marginBottom: 40 }}>
        <svg viewBox="0 0 140 200" width="140" height="200"
          style={{ animation: 'm-rotate-phone 2.4s ease-in-out infinite' }}>
          <rect x="10" y="5" width="120" height="190" rx="18" stroke="#e8c660" strokeWidth="2.5" fill="none" />
          <rect x="25" y="28" width="90" height="130" rx="4" fill="rgba(232,198,96,0.06)" />
          <line x1="42" y1="16" x2="98" y2="16" stroke="#e8c660" strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="175" r="8" stroke="#e8c660" strokeWidth="2" fill="none" />
        </svg>
        <svg viewBox="0 0 140 200" width="140" height="200"
          style={{ position: 'absolute', inset: 0, animation: 'm-rotate-arrow 2.4s ease-in-out infinite' }}>
          <path d="M130 60 A80 80 0 0 1 70 170" stroke="#e8c660" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <polygon points="70,170 76,158 64,158" fill="#e8c660" />
        </svg>
      </div>
      <p style={s.label}>Rotate Device</p>
      <p style={s.sub}>Please rotate your phone to landscape</p>
    </div>
  )
}

/* ─── LOADING ──────────────────────────────────────────── */
function LoadingScreen({ progress, assetHint }) {
  const pct = Math.min(100, Math.max(0, Math.round((progress ?? 0) * 100)))
  const msg = assetHint ? `Loading Assets — ${assetHint}` : 'Loading Assets'

  return (
    <div style={s.root}>
      <svg className="m-loader-spinner" viewBox="0 0 48 48" width="56" height="56">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#1e1c18" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#e8c660" strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 20}`}
          strokeDashoffset={`${2 * Math.PI * 20 * (1 - (progress ?? 0))}`}
          strokeLinecap="round" transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <p style={{ ...s.label, marginTop: 28 }}>{msg}</p>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 24px',
      }}>
        <div style={{ flex: 1, height: 2, background: '#1e1c18', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#e8c660', borderRadius: 2,
            width: `${pct}%`,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <span style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: '0.7rem', color: '#5a4e3a',
          minWidth: '2.4em', textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}>{pct}%</span>
      </div>
    </div>
  )
}

/* ─── TAP TO CONTINUE ──────────────────────────────────── */
function TapScreen({ onTap }) {
  function handle() { onTap() }

  return (
    <div onClick={handle} onTouchStart={handle} style={{ ...s.root, cursor: 'pointer',
      userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation',
    }}>
      <div style={{ width: 80, height: 100, position: 'relative', marginBottom: 28 }}>
        <svg viewBox="0 0 60 80" width="80" height="100"
          style={{ animation: 'm-tap-hand 1.8s ease-in-out infinite' }}>
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
      <p style={s.label}>Tap to Continue</p>
      <p style={s.sub}>Fullscreen mode will be enabled</p>
    </div>
  )
}

/* ─── WARNING ──────────────────────────────────────────── */
function WarningScreen({ onContinue }) {
  return (
    <div style={s.root}>
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="#e8c660" strokeWidth="1.5" style={{ marginBottom: 20 }}>
        <circle cx="16" cy="16" r="12" />
        <path d="M12 20 L20 12 M12 12 L20 20" />
      </svg>
      <p style={{
        fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
        fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)',
        color: '#c8bfae', lineHeight: 1.7, margin: 0,
        textAlign: 'center', maxWidth: 320,
      }}>
        This website is optimised for PC. Mobile may experience lag, bugs, and reduced asset quality.
      </p>
      <button onClick={onContinue} style={s.btn}>Continue</button>
      <p style={{
        position: 'fixed', bottom: 20,
        fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
        fontSize: '0.65rem', color: '#3a3428',
        letterSpacing: '0.08em',
      }}>TME — Ved (CEO)</p>
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
  btn: {
    marginTop: 32,
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
}
