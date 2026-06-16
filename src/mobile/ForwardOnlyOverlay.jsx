export default function ForwardOnlyOverlay({ onStartAgain }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'm-fade-in 0.4s ease both',
      background: 'rgba(255,255,255,0.80)',
    }}>
      <div style={{
        background: '#f5efe4',
        borderRadius: 12,
        padding: '36px 32px', maxWidth: 320, textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#c8bfae" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <circle cx="16" cy="16" r="12" />
          <path d="M12 20 L20 12 M12 12 L20 20" />
        </svg>
        <p style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.9rem, 3vw, 1rem)',
          color: '#2a2622', lineHeight: 1.6, margin: '0 0 8px',
          letterSpacing: '0.02em',
        }}>
          You can't scroll backward.
        </p>
        <p style={{
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.75rem, 2.4vw, 0.85rem)',
          color: '#6a5e4a', margin: '0 0 28px',
        }}>
          Want to start again?
        </p>
        <button
          onClick={onStartAgain}
          style={{
            background: '#2a2622',
            border: 'none',
            borderRadius: 6,
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
