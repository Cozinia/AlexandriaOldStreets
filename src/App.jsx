import { useState, useCallback } from 'react'
import TopBar     from './components/TopBar.jsx'
import Sidebar    from './components/Sidebar.jsx'
import MapView    from './components/MapView.jsx'
import DetailCard from './components/DetailCard.jsx'
import StatusBar  from './components/StatusBar.jsx'
import Legend     from './components/Legend.jsx'
import PhotoModal from './components/PhotoModal.jsx'

export default function App() {
  const [selectedStreet, setSelectedStreet] = useState(null)
  const [loadingStreet,  setLoadingStreet]  = useState(null)
  const [locStatus,      setLocStatus]      = useState(null)
  const [status,         setStatusState]    = useState({ loading: false, text: '' })
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [selectedPhoto,  setSelectedPhoto]  = useState(null)
  const [showPhotos,     setShowPhotos]     = useState(true)
  const setStatus = useCallback((loading, text) => {
    setStatusState({ loading, text })
  }, [])

  const selectStreet = useCallback((sd) => {
    setSelectedStreet(sd)
    setLoadingStreet(sd)
    setLocStatus('locating')
    setSidebarOpen(false)
  }, [])

  const closeDetail = useCallback(() => {
    setSelectedStreet(null)
    setLoadingStreet(null)
    setLocStatus(null)
  }, [])

  const handleLocStatus = useCallback((s) => {
    setLocStatus(s)
    setLoadingStreet(null)
  }, [])

  return (
    <div className="app">
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="main">
        <div className={`sb-backdrop${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
        <Sidebar
          selectedStreet={selectedStreet}
          loadingStreet={loadingStreet}
          onSelect={selectStreet}
          open={sidebarOpen}
        />
        <div className="map-wrap">
          <MapView
            selectedStreet={selectedStreet}
            onStreetClick={selectStreet}
            onMapClick={closeDetail}
            onStatus={setStatus}
            onLocStatus={handleLocStatus}
            onPhotoClick={setSelectedPhoto}
            showPhotos={showPhotos}
          />
          <button
            className={`photo-toggle${showPhotos ? ' on' : ''}`}
            onClick={() => setShowPhotos(v => !v)}
            title={showPhotos ? 'Ascunde fotografiile' : 'Afișează fotografiile'}
          >
            <span className="photo-toggle-icon">🖼</span>
            <span className="photo-toggle-label">{showPhotos ? 'Foto: ON' : 'Foto: OFF'}</span>
          </button>
          <Legend />
          <StatusBar text={status.text} loading={status.loading} />
          <DetailCard
            street={selectedStreet}
            locStatus={locStatus}
            onClose={closeDetail}
          />
        </div>
      </div>
      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  )
}
