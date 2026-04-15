export default function StreetItem({ street, selected, loading, onSelect }) {
  const hasOld  = street.oldNames.length > 0
  const subText = hasOld
    ? `← ${street.oldNames.join(' / ')}`
    : `${street.type} · nr. ${street.nr}`

  return (
    <div
      className={`si ${hasOld ? 'renamed' : 'same'}${selected ? ' on' : ''}`}
      onClick={() => onSelect(street)}
    >
      <div className="dot" />
      <div className="si-body">
        <div className="si-name">{street.current}</div>
        <div className={`si-sub${hasOld ? ' old' : ''}`}>{subText}</div>
      </div>
      <div className="si-end">
        {loading
          ? <div className="loc-spin" />
          : <span className="arr">›</span>
        }
      </div>
    </div>
  )
}
