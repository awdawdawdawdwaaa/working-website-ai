const outlines = new Map()
let characterRefs = null
let version = 0

export function registerPropOutline(id, points) {
  if (!id || !Array.isArray(points) || points.length < 2) return
  outlines.set(id, points.map((point) => point.clone()))
  version += 1
}

export function getPropOutline(id) {
  return outlines.get(id) ?? null
}

export function getOutlineVersion() {
  return version
}

export function registerCharacterRefs(refs) {
  characterRefs = refs
}

export function getCharacterRefs() {
  return characterRefs
}

// ─── LINE STATE (shared between SingleLightLine and CameraRig) ───
const lineState = { centerPoint: null, headPoint: null, focusPoint: null, count: 0 }

export function registerLineState(state) {
  if (state.centerPoint) lineState.centerPoint = state.centerPoint.clone()
  if (state.headPoint) lineState.headPoint = state.headPoint.clone()
  if (state.focusPoint) lineState.focusPoint = state.focusPoint.clone()
  if (state.count !== undefined) lineState.count = state.count
}

export function getLineState() {
  return lineState
}

// ─── SLOW FACTOR (prop proximity slow-down, computed in CameraRig) ───
let _slowFactor = 1.0

export function registerSlowFactor(f) {
  _slowFactor = f
}

export function getSlowFactor() {
  return _slowFactor
}

// ─── LINE SPEED MULTIPLIER (slow line during PC room entry) ───
let _lineSpeedMultiplier = 1.0

export function setLineSpeedMultiplier(f) {
  _lineSpeedMultiplier = f
}

export function getLineSpeedMultiplier() {
  return _lineSpeedMultiplier
}

// ─── FOCUSED PROP (spatially determined) ───
let _focusedProp = null
let _focusedPropId = null
let _focusDistance = Infinity
let _focusAlignment = 0
let _focusScreenError = 1

export function registerFocusedProp(prop, id, distance, alignment, screenError) {
  _focusedProp = prop
  _focusedPropId = id
  _focusDistance = distance
  _focusAlignment = alignment
  _focusScreenError = screenError
}

export function getFocusedProp() {
  return _focusedProp
}

export function getFocusedPropId() {
  return _focusedPropId
}

export function getFocusDistance() {
  return _focusDistance
}

export function getFocusAlignment() {
  return _focusAlignment
}

export function getFocusScreenError() {
  return _focusScreenError
}
