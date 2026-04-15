import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { STREETS } from '../data/streets.js'
import { norm } from '../utils/normalize.js'
import { fetchOverpass } from '../utils/overpass.js'
import { fetchStreetGeometry } from '../utils/nominatim.js'

// ── Street lookup built once at module level ──────────────────────
const lookup = {}
STREETS.forEach(s => {
  lookup[norm(s.current)] = s
  ;(s.aliases || []).forEach(a => { lookup[norm(a)] = s })
})

function matchStreet(osmName) {
  const n = norm(osmName)
  if (lookup[n]) return lookup[n]
  for (const [k, d] of Object.entries(lookup)) {
    if (n.length >= 4 && k.includes(n)) return d
    if (k.length >= 4 && n.includes(k)) return d
  }
  return null
}

// ── Map controller (must be inside MapContainer) ──────────────────
function MapController({ selectedStreet, onStreetClick, onMapClick, onStatus, onLocStatus }) {
  const map          = useMap()
  const layerCache   = useRef({})   // name → [L.polyline]
  const styleCache   = useRef({})   // name → style object
  const prevSelected = useRef(null)

  // Initial Overpass load
  useEffect(() => {
    async function load() {
      onStatus(true, 'Se incarca harta…')
      const data = await fetchOverpass(msg => onStatus(true, msg))

      if (!data) {
        onStatus(false, 'Click pe o strada din lista pentru a o localiza pe harta')
        setTimeout(() => onStatus(false, ''), 5000)
        return
      }

      const nodes = {}
      data.elements.forEach(el => {
        if (el.type === 'node') nodes[el.id] = [el.lat, el.lon]
      })

      data.elements.forEach(el => {
        if (el.type !== 'way' || !el.tags?.name) return
        const coords = (el.nodes || []).map(id => nodes[id]).filter(Boolean)
        if (coords.length < 2) return

        const sd     = matchStreet(el.tags.name)
        const hasOld = sd && sd.oldNames.length > 0

        const style = sd
          ? { color: '#94a3b8', weight: 3, opacity: 0.8 }
          : { color: '#cbd5e1', weight: 2, opacity: 0.5 }

        const line = L.polyline(coords, { ...style, interactive: !!sd })

        if (sd) {
          styleCache.current[sd.current] = { ...style }
          layerCache.current[sd.current] ??= []
          layerCache.current[sd.current].push(line)
          line.on('click', e => { L.DomEvent.stopPropagation(e); onStreetClick(sd) })

          const tipHtml = sd.oldNames.length > 0
            ? `<span class="stt-name">${sd.current}</span><span class="stt-old">← ${sd.oldNames[0]}</span>`
            : `<span class="stt-name">${sd.current}</span>`
          line.bindTooltip(tipHtml, { sticky: true, direction: 'top', className: 'street-tooltip' })
        }
        line.addTo(map)
      })

      onStatus(false, '')
    }

    load()
    map.on('click', onMapClick)
    return () => map.off('click', onMapClick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle selection changes
  useEffect(() => {
    // Restore previous street style
    const prev = prevSelected.current
    if (prev && layerCache.current[prev]) {
      const ds = styleCache.current[prev]
      if (ds) layerCache.current[prev].forEach(l => l.setStyle(ds))
    }

    if (!selectedStreet) { prevSelected.current = null; return }
    prevSelected.current = selectedStreet.current

    // Already loaded — highlight immediately
    if (layerCache.current[selectedStreet.current]?.length > 0) {
      layerCache.current[selectedStreet.current].forEach(l =>
        l.setStyle({ color: '#7c3aed', weight: 7, opacity: 1 })
      )
      onLocStatus('found')
      return
    }

    // Fetch via Nominatim
    async function locate() {
      onLocStatus('locating')
      const result = await fetchStreetGeometry(selectedStreet)

      // Guard: user may have deselected while we were fetching
      if (prevSelected.current !== selectedStreet.current) return

      if (!result || result.type === 'notfound') { onLocStatus('notfound'); return }

      if (result.type === 'line') {
        const hasOld = selectedStreet.oldNames.length > 0
        const layers = []
        const tipHtml = selectedStreet.oldNames.length > 0
          ? `<span class="stt-name">${selectedStreet.current}</span><span class="stt-old">← ${selectedStreet.oldNames[0]}</span>`
          : `<span class="stt-name">${selectedStreet.current}</span>`
        result.segments.forEach(coords => {
          if (coords.length < 2) return
          const line = L.polyline(coords, { color: '#7c3aed', weight: 7, opacity: 1 })
          line.on('click', e => { L.DomEvent.stopPropagation(e); onStreetClick(selectedStreet) })
          line.bindTooltip(tipHtml, { sticky: true, direction: 'top', className: 'street-tooltip' })
          line.addTo(map)
          layers.push(line)
        })
        styleCache.current[selectedStreet.current] = { color: '#94a3b8', weight: 3, opacity: 0.8 }
        layerCache.current[selectedStreet.current] = layers
        onLocStatus('found')
      } else {
        L.circleMarker(result.latlng, { radius: 10, color: '#7c3aed', weight: 3, fillColor: '#ede9fe', fillOpacity: 0.9 }).addTo(map)
        onLocStatus('approx')
      }
    }

    locate()
  }, [selectedStreet]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ── Public component ──────────────────────────────────────────────
export default function MapView({ selectedStreet, onStreetClick, onMapClick, onStatus, onLocStatus }) {
  return (
    <MapContainer
      center={[43.9769, 25.3332]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />
      <ZoomControl position="topleft" />
      <MapController
        selectedStreet={selectedStreet}
        onStreetClick={onStreetClick}
        onMapClick={onMapClick}
        onStatus={onStatus}
        onLocStatus={onLocStatus}
      />
    </MapContainer>
  )
}
