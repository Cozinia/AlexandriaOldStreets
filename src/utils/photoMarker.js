import L from 'leaflet'

/**
 * Creates a rectangular Instagram-style photo pin marker.
 * @param {string} photoUrl - URL of the photo to display
 * @param {number} size - Width/height of the photo in px (default 70)
 */
export function createPhotoMarker(photoUrl, size = 70) {
  const border = 3
  const radius = 12
  const innerRadius = radius - border
  const outer = size + border * 2
  const tailW = 12
  const tailH = 12

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 14px rgba(0,0,0,0.45))">
      <div style="background:linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%);padding:${border}px;border-radius:${radius}px;line-height:0;">
        <img
          src="${photoUrl}"
          width="${size}"
          height="${size}"
          style="object-fit:cover;border-radius:${innerRadius}px;display:block;"
          draggable="false"
        />
      </div>
      <div style="width:0;height:0;border-left:${tailW}px solid transparent;border-right:${tailW}px solid transparent;border-top:${tailH}px solid #2563eb;margin-top:-1px;"></div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [outer, outer + tailH],
    iconAnchor: [outer / 2, outer + tailH],
    popupAnchor: [0, -(outer + tailH)],
  })
}
