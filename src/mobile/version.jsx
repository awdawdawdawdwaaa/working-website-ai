export const VERSION = '0.3'

export default function VersionDisplay() {
  return (
    <div style={{
      position: 'fixed', bottom: 8, right: 10, zIndex: 9999,
      fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
      fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
      letterSpacing: '0.08em', pointerEvents: 'none',
      userSelect: 'none',
    }}>
      v{VERSION}
    </div>
  )
}
