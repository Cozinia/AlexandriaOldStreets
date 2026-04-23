import { STREETS } from '../data/streets.js'

export default function TopBar({ sidebarOpen, onToggleSidebar }) {
  const renamed = STREETS.filter(s => s.oldNames.length > 0).length
  const same    = STREETS.length - renamed

  return (
    <div className="topbar">
      <button className={`burger${sidebarOpen ? ' open' : ''}`} onClick={onToggleSidebar} title="Strazi">
        <span /><span /><span />
      </button>
      <div className="logo">🗺</div>
      <div>
        <h1>Nomenclatorul Strazilor Alexandria, Teleorman</h1>
      </div>
      <div className="spacer" />
      <span className="pill pill-r">{renamed} redenumite</span>
      <span className="pill pill-s">{same} neschimbate</span>
      <span className="pill pill-t">{STREETS.length} strazi</span>
    </div>
  )
}
