import * as THREE from 'three'
import { getAssetEntries } from './AssetMap'

const YIELD_MS = 60

export default async function loadMobileAssets(onProgress) {
  THREE.Cache.enabled = true

  const entries = getAssetEntries()
  const total = entries.length

  for (let i = 0; i < total; i++) {
    const [desktopPath, mobilePath] = entries[i]

    const resp = await fetch(mobilePath)
    if (!resp.ok) throw new Error(`Failed to load: ${mobilePath}`)

    const buffer = await resp.arrayBuffer()
    THREE.Cache.add(desktopPath, buffer)

    onProgress((i + 1) / total, desktopPath)

    await new Promise(r => setTimeout(r, YIELD_MS))
    await new Promise(r => requestAnimationFrame(r))
  }
}
