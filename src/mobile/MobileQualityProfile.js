import * as THREE from 'three'

let applied = false

export default function applyMobileQuality() {
  if (applied) return
  applied = true

  THREE.Texture.DEFAULT_ANISOTROPY = 1

  if (typeof window !== 'undefined') {
    window.__MOBILE_QUALITY = true
  }
}
