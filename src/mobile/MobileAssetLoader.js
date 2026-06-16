import * as THREE from 'three'
import { getAssetEntries } from './AssetMap'
import { loadWithCache, getCacheStats } from './cache/MobileAssetCache'

export default async function loadMobileAssets(onProgress) {
  THREE.Cache.enabled = true

  const entries = getAssetEntries()

  for (let i = 0; i < entries.length; i++) {
    const [desktopPath, mobilePath] = entries[i]

    const buffer = await loadWithCache(mobilePath, desktopPath, async () => {
      const resp = await fetch(mobilePath)
      if (!resp.ok) throw new Error(`Failed: ${mobilePath}`)
      const buf = await resp.arrayBuffer()
      try {
        sessionStorage.setItem('mob_size_' + mobilePath, String(buf.byteLength))
      } catch {}
      return buf
    })

    THREE.Cache.add(desktopPath, buffer)

    onProgress((i + 1) / entries.length, desktopPath)
  }

  const stats = await getCacheStats()
  if (typeof window !== 'undefined') {
    window.__MOBILE_CACHE_HITS = stats.cacheHits
    window.__MOBILE_CACHE_COUNT = stats.count
  }
}
