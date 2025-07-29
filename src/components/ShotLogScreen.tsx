import { useState, useEffect } from 'react'
import { useFilmMate } from '../context/FilmMateContext'
import { ShotLog } from '../types'
import './ShotLogScreen.css'

// Add this helper function at the top
const formatExposureDelta = (delta?: number): string => {
  if (delta === undefined || delta === 0) {
    return 'Perfect Exposure'
  }
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}`
}

export function ShotLogScreen() {
  const { state, loadShotLogs, updateShotLog } = useFilmMate()
  const [filteredLogs, setFilteredLogs] = useState<ShotLog[]>([])
  const [selectedLog, setSelectedLog] = useState<ShotLog | null>(null)

  // Load shot logs from database on component mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        await loadShotLogs()
      } catch (error) {
        // Error loading shot logs
      }
    }
    loadLogs()
  }, [loadShotLogs])

  // Sort logs by date (newest first)
  useEffect(() => {
    const logs = [...state.shotLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    setFilteredLogs(logs)
  }, [state.shotLogs])

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatShutterSpeed = (speed: number): string => {
    if (speed >= 1) {
      return `1/${speed}s`
    } else {
      return `${1/speed}s`
    }
  }

  const handleRatingChange = async (logId: string, rating: number) => {
    const updatedLog = state.shotLogs.find(log => log.id === logId)
    if (updatedLog) {
      const newLog = { ...updatedLog, rating }
      try {
        await updateShotLog(newLog)
      } catch (error) {
        // Error updating shot log rating
      }
    }
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating?: number; 
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    const stars = [1, 2, 3, 4, 5]
    
    return (
      <div className="star-rating">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${rating && rating >= star ? 'filled' : 'empty'}`}
            onClick={() => !readonly && onRatingChange?.(star)}
            disabled={readonly}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
        {rating && (
          <span className="rating-text">({rating}/5)</span>
        )}
      </div>
    )
  }

  const LogCard = ({ log, onClick }: { log: ShotLog; onClick: () => void }) => {
    // Check if originalSettings exists (for backward compatibility with old records)
    const hasOriginalSettings = log.originalSettings && 
                               log.originalSettings.aperture && 
                               log.originalSettings.shutterSpeed;
    
    // Check if settings were modified
    const settingsModified = hasOriginalSettings && (
      log.originalSettings.aperture !== log.selectedSettings.aperture || 
      log.originalSettings.shutterSpeed !== log.selectedSettings.shutterSpeed
    );
    
    return (
      <div className="log-card" onClick={onClick}>
        <div className="log-header">
          <h3>{formatDate(log.timestamp)}</h3>
          <span className="log-camera">{log.camera.name}</span>
        </div>
        <div className="log-details">
          <div className="log-equipment">
            <span>{log.lens.name}</span>
            <span>{log.filmStock.name} (ISO {log.filmStock.iso})</span>
          </div>
          <div className="log-settings">
            {settingsModified ? (
              <>
                <span className="selected-settings">
                  <strong>Used:</strong> f/{log.selectedSettings.aperture} • {formatShutterSpeed(log.selectedSettings.shutterSpeed)}
                </span>
                <span className="original-settings">
                  <strong>Original:</strong> f/{log.originalSettings.aperture} • {formatShutterSpeed(log.originalSettings.shutterSpeed)}
                </span>
              </>
            ) : (
              <span className="selected-settings">
                <strong>Settings:</strong> f/{log.selectedSettings.aperture} • {formatShutterSpeed(log.selectedSettings.shutterSpeed)}
              </span>
            )}
            <span className="exposure-delta">
              {formatExposureDelta(log.selectedSettings.exposureDelta)}
            </span>
          </div>
          <div className="log-rating" onClick={(e) => e.stopPropagation()}>
            <StarRating 
              rating={log.rating} 
              onRatingChange={(rating) => handleRatingChange(log.id, rating)}
            />
          </div>
        </div>
        {log.notes && (
          <div className="log-notes">
            <p>{log.notes}</p>
          </div>
        )}
      </div>
    )
  }

  const LogDetail = ({ log, onClose }: { log: ShotLog; onClose: () => void }) => {
    // Check if originalSettings exists (for backward compatibility with old records)
    const hasOriginalSettings = log.originalSettings && 
                               log.originalSettings.aperture && 
                               log.originalSettings.shutterSpeed;
    
    // Check if settings were modified
    const settingsModified = hasOriginalSettings && (
      log.originalSettings.aperture !== log.selectedSettings.aperture || 
      log.originalSettings.shutterSpeed !== log.selectedSettings.shutterSpeed
    );
    
    return (
      <div className="log-detail-overlay" onClick={onClose}>
        <div className="log-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Shot Details</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-content">
            <div className="detail-section">
              <h3>Date & Time</h3>
              <p>{formatDate(log.timestamp)}</p>
            </div>

            <div className="detail-section">
              <h3>Rating</h3>
              <StarRating 
                rating={log.rating} 
                onRatingChange={(rating) => handleRatingChange(log.id, rating)}
              />
            </div>

            <div className="detail-section">
              <h3>Equipment & Conditions</h3>
              <div className="detail-grid">
                <div><strong>Camera:</strong> {log.camera.name}</div>
                <div><strong>Lens:</strong> {log.lens.name}</div>
                <div><strong>Film:</strong> {log.filmStock.name} (ISO {log.filmStock.iso})</div>
                <div><strong>Lighting:</strong> {log.lightingCondition.name}</div>
                <div><strong>EV Value:</strong> {log.lightingCondition.evValue}</div>
                <div><strong>Description:</strong> {log.lightingCondition.description}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Settings Used</h3>
              <div className="selected-settings-highlight">
                <div className="settings-display">
                  <div className="setting-item">
                    <span className="setting-label">Aperture</span>
                    <span className="setting-value">f/{log.selectedSettings.aperture}</span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Shutter Speed</span>
                    <span className="setting-value">{formatShutterSpeed(log.selectedSettings.shutterSpeed)}</span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">ISO</span>
                    <span className="setting-value">{log.selectedSettings.iso}</span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Exposure</span>
                    <span className="setting-value">{formatExposureDelta(log.selectedSettings.exposureDelta)}</span>
                  </div>
                </div>
              </div>
            </div>

            {settingsModified && (
              <div className="detail-section">
                <h3>Original Settings (Before Editing)</h3>
                <div className="original-settings-highlight">
                  <div className="settings-display">
                    <div className="setting-item">
                      <span className="setting-label">Aperture</span>
                      <span className="setting-value">f/{log.originalSettings.aperture}</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Shutter Speed</span>
                      <span className="setting-value">{formatShutterSpeed(log.originalSettings.shutterSpeed)}</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">ISO</span>
                      <span className="setting-value">{log.originalSettings.iso}</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Exposure</span>
                      <span className="setting-value">{formatExposureDelta(log.originalSettings.exposureDelta)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {log.notes && (
              <div className="detail-section">
                <h3>Notes</h3>
                <p className="notes-text">{log.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shot-log-screen">
      <div className="log-container">
        <div className="log-header-section">
          <h2>Shot Log</h2>
          <p>View and manage your saved exposure settings</p>
        </div>

        {/* Logs List */}
        <div className="logs-section">
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <h3>No shot logs found</h3>
              <p>Start by calculating some exposure settings and logging your shots.</p>
            </div>
          ) : (
            <div className="logs-grid">
              {filteredLogs.map(log => (
                <LogCard
                  key={log.id}
                  log={log}
                  onClick={() => setSelectedLog(log)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Log Count */}
        <div className="log-count">
          {filteredLogs.length} of {state.shotLogs.length} logs
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetail
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
} 