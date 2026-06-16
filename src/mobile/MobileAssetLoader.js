import * as THREE from 'three'
import { getAssetEntries } from './AssetMap'

export default async function loadMobileAssets(onProgress) {
  THREE.Cache.enabled = true

  const entries = getAssetEntries()

  for (let i = 0; i < entries.length; i++) {
    const [desktopPath, mobilePath] = entries[i]

    const resp = await fetch(mobilePath)
    if (!resp.ok) throw new Error(`Failed: ${mobilePath}`)

    const buffer = await resp.arrayBuffer()
    THREE.Cache.add(desktopPath, buffer)

    onProgress((i + 1) / entries.length, desktopPath)
  }
}
