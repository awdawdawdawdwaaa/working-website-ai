const STAGES = [
  { id: 'prep',       label: 'Preparing assets…',      weight: 0.10 },
  { id: 'models',     label: 'Loading models…',        weight: 0.50 },
  { id: 'environment', label: 'Loading environment…',  weight: 0.15 },
  { id: 'textures',   label: 'Optimising textures…',   weight: 0.10 },
  { id: 'line',       label: 'Building scene…',        weight: 0.10 },
  { id: 'scene',      label: 'Finalising…',            weight: 0.05 },
]

export function getStageForProgress(raw) {
  let cumulative = 0
  for (const stage of STAGES) {
    cumulative += stage.weight
    if (raw <= cumulative) return stage
  }
  return STAGES[STAGES.length - 1]
}

export function progressToLabel(raw) {
  const stage = getStageForProgress(raw)
  return stage.label
}

export function progressToPct(raw) {
  return Math.min(100, Math.max(0, Math.round(raw * 100)))
}
