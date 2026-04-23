import { useState, useMemo, useEffect, useRef } from 'react'
import { STREETS } from '../data/streets.js'
import { norm } from '../utils/normalize.js'
import StreetItem from './StreetItem.jsx'

const MODES = [
  { id: 'all',     label: 'Toate' },
  { id: 'renamed', label: 'Redenumite' },
  { id: 'same',    label: 'Neschimbate' },
]

export default function Sidebar({ selectedStreet, loadingStreet, onSelect, open }) {
  const [mode,  setMode]  = useState('all')
  const [query, setQuery] = useState('')
  const activeRef = useRef(null)

  const filtered = useMemo(() => {
    const q = norm(query)
    return STREETS.filter(s => {
      if (mode === 'renamed' && !s.oldNames.length) return false
      if (mode === 'same'    &&  s.oldNames.length) return false
      if (!q) return true
      return norm(s.current).includes(q) || s.oldNames.some(n => norm(n).includes(q))
    })
  }, [mode, query])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedStreet])

  return (
    <div className={`sidebar${open ? ' open' : ''}`}>
      <div className="sb-head">
        <div className="sw">
          <SearchIcon />
          <input
            className="search"
            type="text"
            placeholder="Cauta strada…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="tabs">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`tab${mode === m.id ? ' on' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="street-list">
        {filtered.length === 0 && (
          <div className="empty">Nicio strada gasita.</div>
        )}
        {filtered.map(s => (
          <div key={s.nr} ref={selectedStreet?.nr === s.nr ? activeRef : null}>
            <StreetItem
              street={s}
              selected={selectedStreet?.nr === s.nr}
              loading={loadingStreet?.nr === s.nr}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
