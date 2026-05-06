import { useState, useEffect } from 'react'

export default function PhotoModal({ photo, onClose }) {
  const [idx, setIdx] = useState(0)

  const slides = photo?.photos ?? (photo ? [{ src: photo.photo }] : [])
  const total  = slides.length
  const current = slides[idx]

  useEffect(() => { setIdx(0) }, [photo])

  useEffect(() => {
    if (!photo) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + total) % total)
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % total)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photo, total, onClose])

  if (!photo) return null

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  return (
    <div className="pm-backdrop" onClick={onClose}>
      <div className="pm-card" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Închide">×</button>

        <div className="pm-img-wrap">
          <img src={current.src} alt={current.sublabel ?? photo.label} className="pm-img" draggable="false" />
          {total > 1 && (
            <>
              <button className="pm-nav pm-nav-l" onClick={prev} aria-label="Anterior">&#8249;</button>
              <button className="pm-nav pm-nav-r" onClick={next} aria-label="Următor">&#8250;</button>
              <div className="pm-counter">{idx + 1} / {total}</div>
            </>
          )}
        </div>

        <div className="pm-body">
          <p className="pm-location">{photo.location}</p>
          <h2 className="pm-title">{current.sublabel ?? photo.label}</h2>
          <div className="pm-names">
            <div className="pm-name-row">
              <span className="pm-name-tag old">Denumire veche</span>
              <span className="pm-name-val">{photo.oldName}</span>
            </div>
            <div className="pm-name-row">
              <span className="pm-name-tag new">Denumire nouă</span>
              <span className="pm-name-val">{photo.newName}</span>
            </div>
          </div>
          <p className="pm-credit">
            Foto: <a href="https://www.facebook.com/Alexandria.Teleorman.Romania" target="_blank" rel="noopener noreferrer">Alexandria Teleorman</a>
          </p>
        </div>
      </div>
    </div>
  )
}
