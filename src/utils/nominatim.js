import { cacheGet, cacheSet, TTL_NOMINATIM } from './cache.js'
import { norm } from './normalize.js'

const CITY_BOX = { minLat: 43.94, maxLat: 44.01, minLon: 25.28, maxLon: 25.40 }

function inCity(r) {
  const la = parseFloat(r.lat), lo = parseFloat(r.lon)
  return la >= CITY_BOX.minLat && la <= CITY_BOX.maxLat
      && lo >= CITY_BOX.minLon && lo <= CITY_BOX.maxLon
}

export async function fetchStreetGeometry(sd) {
  const cacheKey = 'nom_' + norm(sd.current)
  const cached   = cacheGet(cacheKey, d => d && ['line', 'point', 'notfound'].includes(d.type))
  if (cached) return cached

  const queries = [
    `${sd.type} ${sd.current}, Alexandria, Teleorman, Romania`,
    `${sd.current}, Alexandria, Romania`,
    ...(sd.aliases || []).map(a => `${sd.type} ${a}, Alexandria, Romania`),
  ]

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search`
        + `?q=${encodeURIComponent(q)}&format=json&polygon_geojson=1&limit=5&countrycodes=ro`
      const res     = await fetch(url, { headers: { 'Accept-Language': 'ro', 'User-Agent': 'AlexandriaOldStreets/1.0' } })
      const results = await res.json()

      const best = results.find(r => inCity(r) && r.geojson?.type?.includes('Line'))
                || results.find(r => inCity(r))
                || results[0]

      if (!best) continue

      let result
      if (best.geojson?.type === 'LineString') {
        result = { type: 'line', segments: [best.geojson.coordinates.map(c => [c[1], c[0]])] }
      } else if (best.geojson?.type === 'MultiLineString') {
        result = { type: 'line', segments: best.geojson.coordinates.map(seg => seg.map(c => [c[1], c[0]])) }
      } else {
        result = { type: 'point', latlng: [parseFloat(best.lat), parseFloat(best.lon)] }
      }

      cacheSet(cacheKey, result, TTL_NOMINATIM)
      return result
    } catch (e) {
      console.warn('Nominatim fail:', q, e)
    }
  }

  const notFound = { type: 'notfound' }
  cacheSet(cacheKey, notFound, TTL_NOMINATIM)
  return notFound
}
