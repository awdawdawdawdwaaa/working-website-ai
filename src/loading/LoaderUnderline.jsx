export default function LoaderUnderline({ visible }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '72vh',
        width: '260px',
        height: '6px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '3px',
        backgroundColor: '#E8C660',
        opacity: visible ? 1 : 0,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    />
  )
}
