import { useLighting } from './LightingContext'

function formatValue(value, step) {
  if (step < 0.01) return value.toFixed(3)
  if (step < 1) return value.toFixed(2)
  return String(Math.round(value))
}

export default function DevLightPanel() {
  const lighting = useLighting()

  return (
    <div className="dev-stack">
      {lighting.controls.map((control) => {
        const value = lighting[control.key]
        return (
          <label className="dev-slider" key={control.key}>
            <span>
              <b>{control.label}</b>
              <em>{formatValue(value, control.step)}</em>
            </span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={value}
              onChange={(event) => lighting.update(control.key, event.target.value)}
            />
          </label>
        )
      })}

      <button type="button" className="dev-action" onClick={lighting.reset}>
        reset light state
      </button>
    </div>
  )
}
