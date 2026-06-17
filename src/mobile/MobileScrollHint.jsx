export default function MobileScrollHint({ visible }) {
  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      left: '90%',
      top: '76%',
      transform: 'translate(-50%, -50%)',
      zIndex: 999998,
      pointerEvents: 'none',
      opacity: 0.75,
    }}>
      <div className="m-hint-container" style={{
        width: 22, height: 34,
        filter: 'drop-shadow(0 0 6px rgba(232,198,96,0.2))',
      }}>
        <svg viewBox="0 0 20 30" width="22" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="m-hint-hand"
            d="M6 10 C4 10 3 12 3 14 L3 22 C3 26 5 28 9 28 L13 28 C17 28 19 26 19 22 L19 14 C19 12 18 10 16 10"
            stroke="#f5efe4" strokeWidth="0.6" fill="none" opacity="0.6"
          />
          <path className="m-hint-thumb"
            d="M6 10 L6 7 C6 5 7 4 9 4 C11 4 12 5 12 7 L12 10"
            stroke="#f5efe4" strokeWidth="0.6" fill="none" opacity="0.6"
          />
          <circle className="m-hint-p m-hint-p1" cx="12" cy="12" r="0.65" fill="#e8c660" opacity="0" />
          <circle className="m-hint-p m-hint-p2" cx="13" cy="9" r="0.5" fill="#e8c660" opacity="0" />
          <circle className="m-hint-p m-hint-p3" cx="13.5" cy="6" r="0.4" fill="#e8c660" opacity="0" />
        </svg>
      </div>
    </div>
  )
}
