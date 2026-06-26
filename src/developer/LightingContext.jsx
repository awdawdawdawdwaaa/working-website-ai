import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export const DEFAULT_LIGHTING = {
  lampIntensity: 2.35,
  lampWarmth: 0.72,
  ambient: 0.075,
  monitorGlow: 0.18,
  caseLed: 0.82,
  shadowSoftness: 0.55,
  exposure: 0.95,
  dustAmount: 0.24,
}

export const LIGHT_CONTROLS = [
  { key: 'lampIntensity', label: 'lamp intensity', min: 0, max: 5, step: 0.01 },
  { key: 'lampWarmth', label: 'lamp warmth', min: 0, max: 1, step: 0.01 },
  { key: 'ambient', label: 'ambient', min: 0, max: 0.22, step: 0.001 },
  { key: 'monitorGlow', label: 'monitor glow', min: 0, max: 0.6, step: 0.01 },
  { key: 'caseLed', label: 'case led', min: 0, max: 1.4, step: 0.01 },
  { key: 'shadowSoftness', label: 'shadow softness', min: 0, max: 1, step: 0.01 },
  { key: 'exposure', label: 'exposure', min: 0.45, max: 1.55, step: 0.01 },
  { key: 'dustAmount', label: 'dust amount', min: 0, max: 0.7, step: 0.01 },
]

const LightingContext = createContext(null)

function clampToControl(key, value) {
  const control = LIGHT_CONTROLS.find((item) => item.key === key)
  if (!control) return value
  return Math.min(control.max, Math.max(control.min, value))
}

function normalize(values) {
  const next = { ...DEFAULT_LIGHTING, ...values }
  for (const key of Object.keys(next)) {
    next[key] = clampToControl(key, Number(next[key]))
  }
  return next
}

export function LightingProvider({ children }) {
  const [values, setValues] = useState(DEFAULT_LIGHTING)

  const update = useCallback((key, value) => {
    setValues((current) => ({ ...current, [key]: clampToControl(key, Number(value)) }))
  }, [])

  const reset = useCallback(() => {
    setValues(DEFAULT_LIGHTING)
  }, [])

  const applyAll = useCallback((nextValues) => {
    setValues((current) => normalize({ ...current, ...nextValues }))
  }, [])

  const api = useMemo(() => ({
    ...values,
    values,
    controls: LIGHT_CONTROLS,
    update,
    reset,
    applyAll,
  }), [applyAll, reset, update, values])

  return (
    <LightingContext.Provider value={api}>
      {children}
    </LightingContext.Provider>
  )
}

export function useLighting() {
  const ctx = useContext(LightingContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_LIGHTING,
    values: DEFAULT_LIGHTING,
    controls: LIGHT_CONTROLS,
    update: () => {},
    reset: () => {},
    applyAll: () => {},
  }
}

export function getWarmLightColor(warmth) {
  const t = Math.min(1, Math.max(0, warmth))
  const cool = { r: 1.0, g: 0.86, b: 0.66 }
  const warm = { r: 1.0, g: 0.58, b: 0.28 }
  return {
    r: cool.r + (warm.r - cool.r) * t,
    g: cool.g + (warm.g - cool.g) * t,
    b: cool.b + (warm.b - cool.b) * t,
  }
}
