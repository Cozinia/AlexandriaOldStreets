const CACHE_PFX     = 'alexstr_v1_'
export const TTL_OVERPASS  = 7  * 24 * 60 * 60 * 1000
export const TTL_NOMINATIM = 30 * 24 * 60 * 60 * 1000

export function cacheGet(key, validate) {
  try {
    const raw = localStorage.getItem(CACHE_PFX + key)
    if (!raw) return null
    const { data, exp } = JSON.parse(raw)
    if (Date.now() > exp) { localStorage.removeItem(CACHE_PFX + key); return null }
    if (validate && !validate(data)) { localStorage.removeItem(CACHE_PFX + key); return null }
    return data
  } catch {
    localStorage.removeItem(CACHE_PFX + key)
    return null
  }
}

export function cacheSet(key, data, ttl) {
  try {
    localStorage.setItem(CACHE_PFX + key, JSON.stringify({ data, exp: Date.now() + ttl }))
  } catch {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PFX))
        .forEach(k => localStorage.removeItem(k))
      localStorage.setItem(CACHE_PFX + key, JSON.stringify({ data, exp: Date.now() + ttl }))
    } catch {}
  }
}
