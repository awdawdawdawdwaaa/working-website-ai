const TESTS = [
  { id: 'monitor', label: '1 Monitor' },
  { id: 'monitor20', label: '2 Monitor 2.0' },
  { id: 'pc', label: '3 PC Case' },
  { id: 'lamp', label: '4 Lamp' },
  { id: 'scene', label: '5 Full Scene' },
  { id: 'mouse', label: '6 Mouse' },
  { id: 'keyboard', label: '7 Keyboard' },
]

export default function DevTestPanel({
  activeTest,
  onSelect,
}) {
  return (
    <div className="dev-stack">
      <div className="dev-tabs" role="tablist" aria-label="Dev test modes">
        {TESTS.map((test) => (
          <button
            key={test.id}
            type="button"
            className={activeTest === test.id ? 'dev-tab is-active' : 'dev-tab'}
            onClick={() => onSelect?.(test.id)}
          >
            {test.label}
          </button>
        ))}
      </div>

      <div className="dev-note">
        active asset: {TESTS.find((item) => item.id === activeTest)?.label || 'none'}
        <br />
        hidden tabs are unmounted; the canvas stays alive.
      </div>
    </div>
  )
}
