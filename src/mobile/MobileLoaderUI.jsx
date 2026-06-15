const STAGES = [
  { id: 'splash',     label: 'Preparing Experience' },
  { id: 'preparing',  label: 'Preparing Experience' },
  { id: 'loading',    label: 'Loading Assets' },
  { id: 'rendering',  label: 'Rendering Scene' },
  { id: 'entering',   label: 'Entering Experience' },
]

export default function MobileLoaderUI({ stage, progress, assetHint }) {
  const idx = STAGES.findIndex(s => s.id === stage)
  const label = STAGES[idx]?.label ?? 'Loading'
  const progressPct = Math.min(100, Math.max(0, Math.round((progress ?? 0) * 100)))

  const msg = stage === 'loading' && assetHint
    ? `${label} — ${assetHint}`
    : label

  return (
    <div className="m-loader">
      <div className="m-loader-ambient" />

      <div className="m-loader-center">
        <svg className="m-loader-spinner" viewBox="0 0 48 48" width="56" height="56">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1e1c18" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e8c660" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - (progress ?? 0))}`}
            strokeLinecap="round" transform="rotate(-90 24 24)"
            style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
      </div>

      <p className="m-loader-message">{msg}</p>

      <div className="m-loader-bottom">
        <div className="m-loader-track">
          <div className="m-loader-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="m-loader-pct">{progressPct}%</span>
      </div>
    </div>
  )
}
