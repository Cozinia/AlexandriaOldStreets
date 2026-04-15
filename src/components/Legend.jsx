const ITEMS = [
  { color: '#ef4444', label: 'Redenumita' },
  { color: '#3b82f6', label: 'Neschimbata' },
]

export default function Legend() {
  return (
    <div className="legend">
      {ITEMS.map(({ color, label }) => (
        <div key={label} className="leg-r">
          <div className="leg-l" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  )
}
