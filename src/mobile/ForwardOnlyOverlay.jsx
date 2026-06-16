export default function ForwardOnlyOverlay({ onStartAgain }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'm-fade-in 0.4s ease both',
      background: 'rgba(255,255,255,0.12)',
      boxShadow: 'inset 0 0 40px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)',
        transform: 'rotate(-25deg) translateX(-100%)',
        animation: 'm-glass-shine 5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '36px 32px', maxWidth: 320, textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#e8c660" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <circle cx="16" cy="16" r="12" />
          <path d="M12 20 L20 12 M12 12 L20 20" />
        </svg>
        <p style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.9rem, 3vw, 1rem)',
          color: '#f5efe4', lineHeight: 1.6, margin: '0 0 8px',
          letterSpacing: '0.02em',
        }}>
          You can't scroll backward.
        </p>
        <p style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.75rem, 2.4vw, 0.85rem)',
          color: '#8a7d6a', margin: '0 0 28px',
        }}>
          Want to start again?
        </p>
        <button
          onClick={onStartAgain}
          style={{
            background: 'transparent',
            border: '1px solid #e8c660',
            borderRadius: 4,
            color: '#f5efe4',
            fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
            fontSize: '0.8rem',
            padding: '10px 28px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          Start Again
        </button>
      </div>
    </div>
  )
}
