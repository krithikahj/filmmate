import React, { useState, useEffect } from 'react'
import { useFilmMate } from '../context/FilmMateContext'
import { ShotLog } from '../types'
import './ShotLogScreen.css'

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
        console.error('Error loading shot logs:', error)
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
        console.error('Error updating shot log rating:', error)
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

  const LogCard = ({ log, onClick }: { log: ShotLog; onClick: () => void }) => (
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
          <span className="selected-settings">
            <strong>Selected:</strong> f/{log.selectedSettings.aperture} • {formatShutterSpeed(log.selectedSettings.shutterSpeed)}
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

  const LogDetail = ({ log, onClose }: { log: ShotLog; onClose: () => void }) => (
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
            <h3>Equipment</h3>
            <div className="detail-grid">
              <div><strong>Camera:</strong> {log.camera.name}</div>
              <div><strong>Lens:</strong> {log.lens.name}</div>
              <div><strong>Film:</strong> {log.filmStock.name} (ISO {log.filmStock.iso})</div>
              <div><strong>Lighting:</strong> {log.lightingCondition.name}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Selected Settings</h3>
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
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>All Available Settings</h3>
            <div className="settings-comparison">
              <div className="settings-group">
                <h4>Recommended</h4>
                <div className="settings-display">
                  <div className="setting-item">
                    <span className="setting-label">Aperture</span>
                    <span className={`setting-value ${log.selectedSettings === log.recommendedSettings ? 'selected' : ''}`}>
                      f/{log.recommendedSettings.aperture}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Shutter Speed</span>
                    <span className={`setting-value ${log.selectedSettings === log.recommendedSettings ? 'selected' : ''}`}>
                      {formatShutterSpeed(log.recommendedSettings.shutterSpeed)}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">ISO</span>
                    <span className={`setting-value ${log.selectedSettings === log.recommendedSettings ? 'selected' : ''}`}>
                      {log.recommendedSettings.iso}
                    </span>
                  </div>
                </div>
              </div>

              {log.alternativeSettings.length > 0 && (
                <div className="settings-group">
                  <h4>Alternatives</h4>
                  <div className="alternatives-list">
                    {log.alternativeSettings.map((settings, index) => (
                      <div key={index} className={`alternative-item ${log.selectedSettings === settings ? 'selected' : ''}`}>
                        <span>f/{settings.aperture}</span>
                        <span>{formatShutterSpeed(settings.shutterSpeed)}</span>
                        <span>ISO {settings.iso}</span>
                        {log.selectedSettings === settings && <span className="selected-badge">Selected</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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