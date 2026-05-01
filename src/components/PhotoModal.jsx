export default function PhotoModal({ photo, onClose }) {
  if (!photo) return null

  return (
    <div className="pm-backdrop" onClick={onClose}>
      <div className="pm-card" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Închide">×</button>
        <img src={photo.photo} alt={photo.label} className="pm-img" draggable="false" />
        <div className="pm-body">
          <p className="pm-location">{photo.location}</p>
          <h2 className="pm-title">{photo.label}</h2>
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
