import { useState } from 'react'
import { getCurrentDevVersion, parseDevVersions } from './DevVersionData'

export default function DevVersionPanel({ compact = false }) {
  const versions = parseDevVersions()
  const current = getCurrentDevVersion()
  const [expanded, setExpanded] = useState({ [current.version]: true })
  const visible = compact ? versions.slice(0, 4) : versions

  return (
    <div className="dev-stack">
      {visible.map((entry) => {
        const open = !!expanded[entry.version]
        return (
          <div className="dev-record" key={entry.version}>
            <button
              type="button"
              className="dev-record-head"
              onClick={() => setExpanded((state) => ({ ...state, [entry.version]: !open }))}
            >
              <span>{entry.version}</span>
              <strong>{entry.title}</strong>
              <em>{entry.date}</em>
            </button>
            {open && (
              <div className="dev-record-body">
                <p>{entry.summary || 'No summary supplied.'}</p>
                {entry.details.map((detail) => (
                  <div key={detail}>- {detail}</div>
                ))}
                {entry.files && <small>files: {entry.files}</small>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
