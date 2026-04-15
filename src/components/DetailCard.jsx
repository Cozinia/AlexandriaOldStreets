const LOC_MESSAGES = {
  locating: 'Se localizeaza pe harta…',
  approx:   'Locatie aproximativa (marker).',
  notfound: 'Locatia nu a putut fi determinata.',
}

export default function DetailCard({ street, locStatus, onClose }) {
  const hasOld = street?.oldNames.length > 0

  return (
    <div className={`dc${street ? ' vis' : ''}`}>
      <div className={`dc-hd${hasOld ? ' red' : ''}`}>
        <button className="dc-close" onClick={onClose}>✕</button>
        <div className="dc-tag">{street?.type}</div>
        <div className="dc-name">{street?.current}</div>
        <span className="dc-nr">Nr. {street?.nr} din nomenclator</span>
      </div>

      <div className="dc-body">
        {hasOld ? (
          <div className="dc-old-sec">
            <div className="sec-lbl">Denumire anterioara</div>
            {street.oldNames.map((n, i) => (
              <div key={i} className="old-pill">
                <span className="old-pill-arr">←</span>
                <span className="old-pill-name">{n}</span>
              </div>
            ))}
          </div>
        ) : street ? (
          <div className="no-old">Aceasta strada nu a fost redenumita.</div>
        ) : null}

        {locStatus && locStatus !== 'found' && (
          <div className="dc-loc-status">
            {locStatus === 'locating' && <div className="sspin" />}
            <span>{LOC_MESSAGES[locStatus]}</span>
          </div>
        )}
      </div>
    </div>
  )
}
