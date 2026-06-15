import * as THREE from 'three'

function v(x, y, z) {
  return new THREE.Vector3(x, y, z)
}

const CONTROL_POINTS = [
  v(0.00, 1.04, 42.10),
  v(-0.20, 0.98, 43.20),
  v(-0.42, 0.90, 44.40),
  v(-0.60, 0.82, 45.70),
  v(-0.78, 0.80, 46.60),
  v(-0.50, 0.86, 47.00),
  v(0.10, 0.90, 47.08),
  v(0.30, 1.06, 47.14),
  v(0.00, 1.28, 47.20),
  v(0.00, 1.28, 47.222),
]

const curve = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.35)

export function getRoomControlPoints() {
  return CONTROL_POINTS
}

export function getRoomCurve() {
  return curve
}

export function getRoomSamples(count = 220) {
  return curve.getSpacedPoints(count)
}
