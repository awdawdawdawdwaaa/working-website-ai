const historyGlob = import.meta.glob('../../DEV_MODE_HISTORY.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export function getDevHistoryText() {
  const entry = Object.entries(historyGlob)[0]
  return entry ? entry[1] : ''
}

export function parseDevVersions(text = getDevHistoryText()) {
  const versions = []
  const blocks = text.split(/\n(?=##\s+V)/g)

  for (const block of blocks) {
    const header = block.match(/^##\s+(V[0-9.]+)\s*(?:-\s*(.*))?/m)
    if (!header) continue

    const version = header[1].trim()
    const titleFromHeader = (header[2] || '').trim()
    const date = (block.match(/^\-\s+\*\*Date\*\*:\s*(.+)$/m)?.[1] || '').trim()
    const title = (block.match(/^\-\s+\*\*Title\*\*:\s*(.+)$/m)?.[1] || titleFromHeader || version).trim()
    const summary = (block.match(/^\-\s+\*\*Summary\*\*:\s*(.+)$/m)?.[1] || '').trim()
    const files = (block.match(/^\-\s+\*\*Files\*\*:\s*(.+)$/m)?.[1] || '').trim()
    const details = []
    const detailMatch = block.match(/^\-\s+\*\*Details\*\*:\s*\n([\s\S]*?)(?=\n-\s+\*\*|\n##\s+V|$)/m)

    if (detailMatch) {
      for (const line of detailMatch[1].split('\n')) {
        const item = line.replace(/^\s*-\s*/, '').trim()
        if (item) details.push(item)
      }
    }

    versions.push({ version, title, date, summary, details, files })
  }

  return versions
}

export function getCurrentDevVersion() {
  return parseDevVersions()[0] || {
    version: 'V0.0',
    title: 'Dev Mode',
    date: '',
    summary: 'No version history detected.',
    details: [],
    files: '',
  }
}
