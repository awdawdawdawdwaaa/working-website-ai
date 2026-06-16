const DB_NAME = 'mobile-asset-cache'
const DB_VERSION = 1
const STORE_NAME = 'assets'
const TTL_MS = 24 * 60 * 60 * 1000
const CACHE_HITS_KEY = 'mob_cache_hits'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getCachedAsset(url) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(url)
      req.onsuccess = () => {
        const entry = req.result
        if (entry && Date.now() - entry.timestamp < TTL_MS) {
          resolve(entry.data)
        } else {
          if (entry) {
            const del = store.delete(url)
            del.onsuccess = () => resolve(null)
          } else {
            resolve(null)
          }
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function setCachedAsset(url, data) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put({ data, timestamp: Date.now(), url }, url)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {}
}

export async function getCacheStats() {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => {
        const entries = req.result || []
        const totalBytes = entries.reduce((s, e) => s + (e.data?.byteLength || 0), 0)
        const cacheHits = (() => {
          try { return Number(sessionStorage.getItem(CACHE_HITS_KEY)) || 0 } catch { return 0 }
        })()
        resolve({ count: entries.length, totalBytes, cacheHits })
      }
      req.onerror = () => resolve({ count: 0, totalBytes: 0, cacheHits: 0 })
    })
  } catch {
    return { count: 0, totalBytes: 0, cacheHits: 0 }
  }
}

function recordCacheHit() {
  try {
    const current = Number(sessionStorage.getItem(CACHE_HITS_KEY)) || 0
    sessionStorage.setItem(CACHE_HITS_KEY, String(current + 1))
  } catch {}
}

export async function loadWithCache(mobilePath, desktopPath, fetchFn) {
  const cached = await getCachedAsset(mobilePath)
  if (cached) {
    recordCacheHit()
    return cached
  }

  const buffer = await fetchFn()

  await setCachedAsset(mobilePath, buffer)

  return buffer
}

if (typeof window !== 'undefined') {
  window.__MOBILE_CACHE_READY = true
}
