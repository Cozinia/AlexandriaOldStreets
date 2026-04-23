import { cacheGet, cacheSet, TTL_OVERPASS } from './cache.js'

const ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

const BBOX  = '43.940,25.280,44.010,25.395'
const QUERY = `[out:json][timeout:28];(way["highway"]["name"](${BBOX}););out body;>;out skel qt;`

export async function fetchOverpass(onStatus) {
  const cached = cacheGet('overpass', d => d && Array.isArray(d.elements))
  if (cached) {
    onStatus?.('Se restaureaza din cache…')
    return cached
  }

  for (const ep of ENDPOINTS) {
    try {
      onStatus?.(`Conectare: ${ep.replace('https://', '').split('/')[0]}…`)
      const ctrl = new AbortController()
      const tid  = setTimeout(() => ctrl.abort(), 20000)
      const res  = await fetch(ep, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    `data=${encodeURIComponent(QUERY)}`,
        signal:  ctrl.signal,
      })
      clearTimeout(tid)
      if (!res.ok) throw new Error(res.status)
      const data = await res.json()
      cacheSet('overpass', data, TTL_OVERPASS)
      return data
    } catch (e) {
      console.warn('Overpass EP failed:', ep, e.message)
    }
  }
  return null
}
