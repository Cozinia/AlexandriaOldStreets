import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { STREETS } from '../data/streets.js'
import { PHOTO_MARKERS } from '../data/photoMarkers.js'
import { createPhotoMarker } from '../utils/photoMarker.js'
import { norm } from '../utils/normalize.js'
import { fetchOverpass } from '../utils/overpass.js'
import { fetchStreetGeometry } from '../utils/nominatim.js'

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

function MapController({ selectedStreet, onStreetClick, onMapClick, onStatus, onLocStatus, onPhotoClick, showPhotos }) {
  const map            = useMap()
  const layerCache     = useRef({})
  const styleCache     = useRef({})
  const prevSelected   = useRef(null)
  const pendingLookup  = useRef(null)
  const lastNominatim  = useRef(0)
  const photoLayers    = useRef([])

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

        const sd    = matchStreet(el.tags.name)
        const style = sd
          ? { color: '#94a3b8', weight: 5, opacity: 0.8 }
          : { color: '#cbd5e1', weight: 3, opacity: 0.5 }

        const line = L.polyline(coords, { ...style, interactive: !!sd })

        if (sd) {
          styleCache.current[sd.current] = { ...style }
          layerCache.current[sd.current] ??= []
          layerCache.current[sd.current].push(line)
          line.on('click', e => { L.DomEvent.stopPropagation(e); onStreetClick(sd) })

          const tipHtml = sd.oldNames.length > 0
            ? `<span class="stt-name">${esc(sd.current)}</span>${sd.oldNames.map(n => `<span class="stt-old">← ${esc(n)}</span>`).join('')}`
            : `<span class="stt-name">${esc(sd.current)}</span>`
          line.bindTooltip(tipHtml, { sticky: true, direction: 'top', className: 'street-tooltip' })
        }
        line.addTo(map)
      })

      onStatus(false, '')

      // Photo pin markers
      PHOTO_MARKERS.forEach(pm => {
        const marker = L.marker(pm.latlng, { icon: createPhotoMarker(pm.photo) })
        const tip = pm.location
          ? `<span class="stt-name">${pm.label}</span><span class="stt-old">${pm.location}</span>`
          : `<span class="stt-name">${pm.label}</span>`
        marker.bindTooltip(tip, { direction: 'top', className: 'street-tooltip' })
        marker.on('click', e => { L.DomEvent.stopPropagation(e); onPhotoClick(pm) })
        marker.addTo(map)
        photoLayers.current.push(marker)
      })
    }

    load()
    map.on('click', onMapClick)
    return () => map.off('click', onMapClick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    photoLayers.current.forEach(m => showPhotos ? m.addTo(map) : m.remove())
  }, [showPhotos]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prev = prevSelected.current
    if (prev && layerCache.current[prev]) {
      const ds = styleCache.current[prev]
      if (ds) layerCache.current[prev].forEach(l => l.setStyle(ds))
    }

    if (!selectedStreet) { prevSelected.current = null; return }
    prevSelected.current = selectedStreet.current

    if (layerCache.current[selectedStreet.current]?.length > 0) {
      layerCache.current[selectedStreet.current].forEach(l =>
        l.setStyle({ color: '#2563eb', weight: 9, opacity: 1 })
      )
      onLocStatus('found')
      return
    }

    async function locate() {
      if (pendingLookup.current === selectedStreet.current) return
      pendingLookup.current = selectedStreet.current

      try {
        const wait = 1100 - (Date.now() - lastNominatim.current)
        if (wait > 0) await new Promise(r => setTimeout(r, wait))

        if (prevSelected.current !== selectedStreet.current) return

        lastNominatim.current = Date.now()
        onLocStatus('locating')
        const result = await fetchStreetGeometry(selectedStreet)

        if (prevSelected.current !== selectedStreet.current) return

        if (!result || result.type === 'notfound') { onLocStatus('notfound'); return }

        if (result.type === 'line') {
          const layers = []
          const tipHtml = selectedStreet.oldNames.length > 0
            ? `<span class="stt-name">${esc(selectedStreet.current)}</span>${selectedStreet.oldNames.map(n => `<span class="stt-old">← ${esc(n)}</span>`).join('')}`
            : `<span class="stt-name">${esc(selectedStreet.current)}</span>`
          result.segments.forEach(coords => {
            if (coords.length < 2) return
            const line = L.polyline(coords, { color: '#2563eb', weight: 9, opacity: 1 })
            line.on('click', e => { L.DomEvent.stopPropagation(e); onStreetClick(selectedStreet) })
            line.bindTooltip(tipHtml, { sticky: true, direction: 'top', className: 'street-tooltip' })
            line.addTo(map)
            layers.push(line)
          })
          styleCache.current[selectedStreet.current] = { color: '#94a3b8', weight: 5, opacity: 0.8 }
          layerCache.current[selectedStreet.current] = layers
          onLocStatus('found')
        } else {
          L.circleMarker(result.latlng, { radius: 10, color: '#2563eb', weight: 3, fillColor: '#ede9fe', fillOpacity: 0.9 }).addTo(map)
          onLocStatus('approx')
        }
      } finally {
        pendingLookup.current = null
      }
    }

    locate()
  }, [selectedStreet]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function MapView({ selectedStreet, onStreetClick, onMapClick, onStatus, onLocStatus, onPhotoClick, showPhotos }) {
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
        onPhotoClick={onPhotoClick}
        showPhotos={showPhotos}
      />
    </MapContainer>
  )
}
