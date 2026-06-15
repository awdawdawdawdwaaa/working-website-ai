import * as THREE from 'three'

export const SNAKE_RADIUS = 150
export const SNAKE_THICKNESS = 8
export const SNAKE_COLOR = '#E8C660'
export const ARC_LENGTH = 220
export const ARC_DEG = (ARC_LENGTH * Math.PI) / 180
export const BODY_POINTS = 60
export const TAIL_FADE = 0.6
export const NOISE_AMP = 8
export const UNDERLINE_W = 260
export const UNDERLINE_H = 6

// Gap at bottom, centered at PI/2 (bottom of circle in canvas coords)
const GAP_HALF = 0.35 // ~20 degrees half-gap in radians
export const ARC_START = Math.PI / 2 + GAP_HALF
export const ARC_END = Math.PI / 2 + 2 * Math.PI - GAP_HALF

// Smooth pseudo-noise: sum of sines
export function waveNoise(angle, time) {
  return (
    Math.sin(angle * 3.1 + time * 0.6) * 3 +
    Math.sin(angle * 5.7 + time * 0.4 + 1.3) * 2.5 +
    Math.cos(angle * 2.3 + time * 0.5 + 0.8) * 2.5
  )
}

export function getCirclePoint(cx, cy, angle, time) {
  const baseX = cx + SNAKE_RADIUS * Math.cos(angle)
  const baseY = cy + SNAKE_RADIUS * Math.sin(angle)
  const noise = waveNoise(angle, time)
  const tx = -Math.sin(angle)
  const ty = Math.cos(angle)
  return {
    x: baseX + tx * noise,
    y: baseY + ty * noise,
  }
}

export function getSnakePoints(cx, cy, headAngle, time) {
  const points = []
  for (let i = 0; i < BODY_POINTS; i++) {
    const t = i / BODY_POINTS
    const angle = headAngle - t * ARC_DEG
    const pt = getCirclePoint(cx, cy, angle, time)
    const alpha = 1 - t * TAIL_FADE
    points.push({ x: pt.x, y: pt.y, alpha })
  }
  return points
}

export function getExitCurve(headPos, underlineY, w, h) {
  const cx = w / 2
  const midY = headPos.y + (underlineY - headPos.y) * 0.3
  const controlPoints = [
    new THREE.Vector3(headPos.x, headPos.y, 0),
    new THREE.Vector3(headPos.x + 30, headPos.y + 40, 0),
    new THREE.Vector3(headPos.x + 60, midY + 20, 0),
    new THREE.Vector3(headPos.x + 20, midY + 40, 0),
    new THREE.Vector3(headPos.x - 20, midY + 60, 0),
    new THREE.Vector3(cx - 40, underlineY - 20, 0),
    new THREE.Vector3(cx, underlineY, 0),
    new THREE.Vector3(cx + UNDERLINE_W / 2, underlineY, 0),
  ]
  return new THREE.CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.35)
}

export let sharedSnakeState = null
export function setSharedSnakeState(state) {
  sharedSnakeState = state
}
