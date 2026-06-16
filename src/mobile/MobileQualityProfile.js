import * as THREE from 'three'

let applied = false

export default function applyMobileQuality() {
  if (applied) return
  applied = true

  THREE.Texture.DEFAULT_ANISOTROPY = 1

  THREE.Texture.DEFAULT_MAG_FILTER = THREE.LinearFilter
  THREE.Texture.DEFAULT_MIN_FILTER = THREE.LinearMipmapLinearFilter

  THREE.Cache.enabled = true

  if (typeof window !== 'undefined') {
    window.__MOBILE_QUALITY = true
  }
}
