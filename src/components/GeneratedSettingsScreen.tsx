import { useState } from 'react'
import { useFilmMate } from '../context/FilmMateContext'
import { ExposureSettings, CreateShotLog } from '../types'
import { APP_CONSTANTS, EXPOSURE_CONSTANTS } from '../utils/constants'
import './GeneratedSettingsScreen.css'

const NOTES_MAX_LENGTH = APP_CONSTANTS.NOTES_MAX_LENGTH

// Add this helper function at the top
const formatExposureDelta = (delta?: number): string => {
  if (delta === undefined || delta === null) return 'N/A'
  if (Math.abs(delta) < 0.1) return 'Perfect'
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} EV`
}

const calculateExposureDelta = (aperture: number, shutterSpeed: number, iso: number, targetEV: number): number => {
  const shutter = 1 / shutterSpeed
  const actualExposureValue = Math.log2(Math.pow(aperture, 2) / shutter) + Math.log2(iso / EXPOSURE_CONSTANTS.ISO_BASE_VALUE)
  const delta = actualExposureValue - targetEV
  return parseFloat(delta.toFixed(2))
}

export function GeneratedSettingsScreen() {
  const { state, calculateExposure, addShotLog } = useFilmMate()
  const [notes, setNotes] = useState('')
  const [showLogForm, setShowLogForm] = useState(false)
  const [selectedSettings, setSelectedSettings] = useState<ExposureSettings | null>(null)
  const [editableSettings, setEditableSettings] = useState<ExposureSettings | null>(null)

  const exposureResult = calculateExposure()

  if (!exposureResult) {
    return (
      <div className="generated-settings-screen">
        <div className="error-container">
          <h2>Unable to Calculate Exposure</h2>
          <p>Please ensure all equipment and conditions are selected.</p>
        </div>
      </div>
    )
  }

  const handleLogShot = async () => {
    if (!state.selectedCamera || !state.selectedLens || !state.selectedFilmStock || !state.selectedLightingCondition || !editableSettings || !selectedSettings) {
      return
    }

    const shotLog: CreateShotLog = {
      timestamp: new Date(),
      camera: state.selectedCamera,
      lens: state.selectedLens,
      filmStock: state.selectedFilmStock,
      lightingCondition: state.selectedLightingCondition,
      recommendedSettings: exposureResult.recommendedSettings,
      alternativeSettings: exposureResult.alternativeSettings,
      originalSettings: selectedSettings, // The settings before editing
      selectedSettings: editableSettings, // The final edited settings
      notes: notes.trim() || undefined
    }

    try {
      await addShotLog(shotLog)
      setNotes('')
      setShowLogForm(false)
      setSelectedSettings(null)
      setEditableSettings(null)
    } catch (error) {
      console.error('Failed to save shot log:', error)
    }
  }

  const handleSelectSettings = (settings: ExposureSettings) => {
    setSelectedSettings(settings)
    setEditableSettings({ ...settings }) // Create a copy for editing
    setShowLogForm(true)
  }

  const handleApertureChange = (newAperture: number) => {
    if (editableSettings && state.selectedLightingCondition) {
      const newExposureDelta = calculateExposureDelta(
        newAperture, 
        editableSettings.shutterSpeed, 
        editableSettings.iso, 
        state.selectedLightingCondition.evValue
      )
      
      setEditableSettings({
        ...editableSettings,
        aperture: newAperture,
        exposureDelta: newExposureDelta
      })
    }
  }

  const handleShutterSpeedChange = (newShutterSpeed: number) => {
    if (editableSettings && state.selectedLightingCondition) {
      const newExposureDelta = calculateExposureDelta(
        editableSettings.aperture, 
        newShutterSpeed, 
        editableSettings.iso, 
        state.selectedLightingCondition.evValue
      )
      
      setEditableSettings({
        ...editableSettings,
        shutterSpeed: newShutterSpeed,
        exposureDelta: newExposureDelta
      })
    }
  }

  const formatShutterSpeed = (speed: number): string => {
    if (speed >= 1) {
      return `1/${speed}s`
    } else {
      return `${1/speed}s`
    }
  }

  const SettingsCard = ({ 
    settings, 
    title, 
    isRecommended = false,
    isSelected = false,
    onSelect
  }: { 
    settings: ExposureSettings, 
    title: string, 
    isRecommended?: boolean,
    isSelected?: boolean,
    onSelect?: () => void
  }) => (
    <div 
      className={`settings-card ${isRecommended ? 'recommended' : ''} ${isSelected ? 'selected' : ''} ${onSelect ? 'selectable' : ''}`}
      onClick={onSelect}
    >
      <h3 className="card-title">{title}</h3>
      <div className="settings-display">
        <div className="setting-item">
          <span className="setting-label">Aperture</span>
          <span className="setting-value">f/{settings.aperture}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Shutter Speed</span>
          <span className="setting-value">{formatShutterSpeed(settings.shutterSpeed)}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">ISO</span>
          <span className="setting-value">{settings.iso}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Exposure</span>
          <span className="setting-value">{formatExposureDelta(settings.exposureDelta)}</span>
        </div>
      </div>
      {onSelect && (
        <div className="card-actions">
          <button className="select-button">
            {isSelected ? 'Selected' : 'Select & Log'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="generated-settings-screen">
      <div className="settings-container">
        <h2>Exposure Recommendations</h2>
        
        {/* Equipment Summary */}
        <div className="equipment-summary">
          <h3>Your Setup</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Camera:</strong> {state.selectedCamera?.name}
            </div>
            <div className="summary-item">
              <strong>Lens:</strong> {state.selectedLens?.name}
            </div>
            <div className="summary-item">
              <strong>Film:</strong> {state.selectedFilmStock?.name} (ISO {state.selectedFilmStock?.iso})
            </div>
            <div className="summary-item">
              <strong>Lighting:</strong> {state.selectedLightingCondition?.name}
            </div>
          </div>
        </div>

        {/* Recommended Settings */}
        <div className="recommended-section">
          <SettingsCard 
            settings={exposureResult.recommendedSettings} 
            title="Recommended Settings" 
            isRecommended={true}
            isSelected={selectedSettings === exposureResult.recommendedSettings}
            onSelect={() => handleSelectSettings(exposureResult.recommendedSettings)}
          />
        </div>

        {/* Alternative Settings */}
        {exposureResult.alternativeSettings.length > 0 && (
          <div className="alternatives-section">
            <h3>Alternative Settings</h3>
            <p className="section-description">Click any option to select and log it</p>
            <div className="alternatives-grid">
              {exposureResult.alternativeSettings.map((settings, index) => (
                <SettingsCard 
                  key={index}
                  settings={settings} 
                  title={`Option ${index + 1}`}
                  isSelected={selectedSettings === settings}
                  onSelect={() => handleSelectSettings(settings)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Log Shot Section */}
        {showLogForm && selectedSettings && editableSettings && (
          <div className="log-shot-section">
            <div className="log-form">
              <h3>Log Selected Settings</h3>
              
              {/* Editable Settings */}
              <div className="editable-settings">
                <h4>Adjust Settings (Optional)</h4>
                <div className="settings-editor">
                  <div className="setting-editor-group">
                    <label htmlFor="aperture-select">Aperture</label>
                    <select
                      id="aperture-select"
                      value={editableSettings.aperture}
                      onChange={(e) => handleApertureChange(Number(e.target.value))}
                    >
                      {state.selectedLens?.availableApertures.map(aperture => (
                        <option key={aperture} value={aperture}>
                          f/{aperture}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="setting-editor-group">
                    <label htmlFor="shutter-select">Shutter Speed</label>
                    <select
                      id="shutter-select"
                      value={editableSettings.shutterSpeed}
                      onChange={(e) => handleShutterSpeedChange(Number(e.target.value))}
                    >
                      {state.selectedCamera?.availableShutterSpeeds.map(speed => (
                        <option key={speed} value={speed}>
                          {formatShutterSpeed(speed)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="current-settings-display">
                  <p><strong>Current:</strong> f/{editableSettings.aperture} • {formatShutterSpeed(editableSettings.shutterSpeed)} • ISO {editableSettings.iso} • {formatExposureDelta(editableSettings.exposureDelta)}</p>
                  <p><strong>Original:</strong> f/{selectedSettings.aperture} • {formatShutterSpeed(selectedSettings.shutterSpeed)} • ISO {selectedSettings.iso} • {formatExposureDelta(selectedSettings.exposureDelta)}</p>
                </div>
              </div>

              <div className="notes-section">
                <label htmlFor="notes">Photo Description (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the shot..."
                  rows={3}
                  maxLength={NOTES_MAX_LENGTH}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowLogForm(false)
                    setNotes('')
                    setSelectedSettings(null)
                    setEditableSettings(null)
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleLogShot}
                >
                  Save Shot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 