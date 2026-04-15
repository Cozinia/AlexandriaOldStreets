import { STREETS } from '../data/streets.js'

export default function TopBar() {
  const renamed = STREETS.filter(s => s.oldNames.length > 0).length
  const same    = STREETS.length - renamed

  return (
    <div className="topbar">
      <div className="logo">🗺</div>
      <div>
        <h1>Nomenclatorul Strazilor — Alexandria, Teleorman</h1>
        {/* <p>HCL nr. 323 · 28 noiembrie 2013 · Click pe o strada pentru detalii</p> */}
      </div>
      <div className="spacer" />
      <span className="pill pill-r">{renamed} redenumite</span>
      <span className="pill pill-s">{same} neschimbate</span>
      <span className="pill pill-t">{STREETS.length} strazi</span>
    </div>
  )
}
