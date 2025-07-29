import { useEffect } from 'react'
import { useFilmMate } from '../context/FilmMateContext'
import { initialCameras, initialLenses, initialFilmStocks, initialLightingConditions } from '../data/initialData'
import './SettingsScreen.css'

interface SettingsScreenProps {
  onReadyToCalculate?: () => void
  onNavigateToResults?: () => void
}

export function SettingsScreen({ onReadyToCalculate, onNavigateToResults }: SettingsScreenProps) {
  const {
    state,
    setCamera,
    setLens,
    setFilmStock,
    setLightingCondition,
    isReadyToCalculate
  } = useFilmMate()

  // Notify parent when ready to calculate
  useEffect(() => {
    if (isReadyToCalculate() && onReadyToCalculate) {
      onReadyToCalculate()
    }
  }, [isReadyToCalculate, onReadyToCalculate])

  const handleCalculate = () => {
    if (isReadyToCalculate()) {
      // Navigate to results screen
      if (onNavigateToResults) {
        onNavigateToResults()
      }
    }
  }

  return (
    <div className="settings-screen">
      <div className="settings-container">
        <h2>Select Your Equipment & Conditions</h2>
        
        <div className="settings-grid">
          {/* Camera Selection */}
          <div className="setting-group">
            <label htmlFor="camera-select">Camera</label>
            <select
              id="camera-select"
              value={state.selectedCamera?.id || ''}
              onChange={(e) => {
                const camera = initialCameras.find(c => c.id === e.target.value)
                if (camera) setCamera(camera)
              }}
            >
              <option value="">Select a camera...</option>
              {initialCameras.map(camera => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lens Selection */}
          <div className="setting-group">
            <label htmlFor="lens-select">Lens</label>
            <select
              id="lens-select"
              value={state.selectedLens?.id || ''}
              onChange={(e) => {
                const lens = initialLenses.find(l => l.id === e.target.value)
                if (lens) setLens(lens)
              }}
            >
              <option value="">Select a lens...</option>
              {initialLenses.map(lens => (
                <option key={lens.id} value={lens.id}>
                  {lens.name}
                </option>
              ))}
            </select>
          </div>

          {/* Film Stock Selection */}
          <div className="setting-group">
            <label htmlFor="film-select">Film Stock</label>
            <select
              id="film-select"
              value={state.selectedFilmStock?.id || ''}
              onChange={(e) => {
                const film = initialFilmStocks.find(f => f.id === e.target.value)
                if (film) setFilmStock(film)
              }}
            >
              <option value="">Select film stock...</option>
              {initialFilmStocks.map(film => (
                <option key={film.id} value={film.id}>
                  {film.name} (ISO {film.iso})
                </option>
              ))}
            </select>
          </div>

          {/* Lighting Condition Selection */}
          <div className="setting-group">
            <label htmlFor="lighting-select">Lighting Condition</label>
            <select
              id="lighting-select"
              value={state.selectedLightingCondition?.id || ''}
              onChange={(e) => {
                const lighting = initialLightingConditions.find(l => l.id === e.target.value)
                if (lighting) setLightingCondition(lighting)
              }}
            >
              <option value="">Select lighting condition...</option>
              {initialLightingConditions.map(lighting => (
                <option key={lighting.id} value={lighting.id}>
                  {lighting.name} - {lighting.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="calculate-section">
          <button
            className={`calculate-button ${isReadyToCalculate() ? 'ready' : 'disabled'}`}
            onClick={handleCalculate}
            disabled={!isReadyToCalculate()}
          >
            {isReadyToCalculate() ? 'Calculate Settings' : 'Select All Options'}
          </button>
        </div>
      </div>
    </div>
  )
} 