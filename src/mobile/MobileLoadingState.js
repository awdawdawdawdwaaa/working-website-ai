const STAGES = [
  { id: 'prep',      label: 'Preparing…',           weight: 0.05 },
  { id: 'models',    label: 'Loading Models…',      weight: 0.55 },
  { id: 'build',     label: 'Building Scene…',      weight: 0.10 },
  { id: 'optimise',  label: 'Optimising…',          weight: 0.08 },
  { id: 'warm',      label: 'Warming GPU…',         weight: 0.12 },
  { id: 'enter',     label: 'Entering World…',      weight: 0.10 },
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
