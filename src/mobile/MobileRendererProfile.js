import * as THREE from 'three'

export const MOBILE_RENDERER = {
  dpr: [0.5, 1.0],
  shadows: false,
  camera: {
    position: [0, 1.60, -1.20],
    fov: 40.5,
    near: 0.1,
    far: 80,
  },
  gl: {
    antialias: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
    precision: 'mediump',
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 0.9,
  },
}

export function applyRendererProfile(gl) {
  gl.setPixelRatio(Math.min(1.0, Math.max(0.5, window.devicePixelRatio || 1)))
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = 0.9
}

if (typeof window !== 'undefined') {
  window.__MOBILE_RENDERER_PROFILE = true
}
