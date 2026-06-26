import { useCallback, useMemo, useState } from 'react'
import { scanner } from './DevProjectScanner'

function reportToText(report) {
  return report.sections
    .map((section) => `${section.title}\n${'='.repeat(section.title.length)}\n${section.content}`)
    .join('\n\n')
}

export default function DevAboutPanel() {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const report = useMemo(() => scanner.scan(), [refreshKey])
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return report.sections
    return report.sections.filter((section) => (
      section.title.toLowerCase().includes(q)
      || section.content.toLowerCase().includes(q)
    ))
  }, [query, report])

  const copyAll = useCallback(() => {
    const text = reportToText(report)
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 900)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {})
      return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
    done()
  }, [report])

  const refresh = useCallback(() => {
    scanner.invalidate()
    setRefreshKey((key) => key + 1)
  }, [])

  return (
    <div className="dev-stack">
      <div className="dev-about-toolbar">
        <button type="button" className="dev-copy" onClick={copyAll}>
          {copied ? 'COPIED' : 'COPY ALL'}
        </button>
        <button type="button" className="dev-action" onClick={refresh}>rescan</button>
      </div>
      <input
        className="dev-about-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="filter about"
      />
      <div className="dev-note">
        scanned {report.stats.sourceFiles} source files, {report.stats.publicAssets} public asset paths
      </div>
      <div className="dev-about-sections">
        {sections.map((section) => (
          <details className="dev-about-section" key={section.title}>
            <summary>{section.title}</summary>
            <pre>{section.content}</pre>
          </details>
        ))}
      </div>
    </div>
  )
}
