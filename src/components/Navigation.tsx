import React from 'react'
import './Navigation.css'

export type Screen = 'settings' | 'generated' | 'logs'

interface NavigationProps {
  currentScreen: Screen
  onScreenChange: (screen: Screen) => void
  canShowGenerated: boolean
}

export function Navigation({ currentScreen, onScreenChange, canShowGenerated }: NavigationProps) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentScreen === 'settings' ? 'active' : ''}`}
            onClick={() => onScreenChange('settings')}
          >
            Settings
          </button>
          <button
            className={`nav-tab ${currentScreen === 'generated' ? 'active' : ''}`}
            onClick={() => onScreenChange('generated')}
            disabled={!canShowGenerated}
          >
            Results
          </button>
          <button
            className={`nav-tab ${currentScreen === 'logs' ? 'active' : ''}`}
            onClick={() => onScreenChange('logs')}
          >
            Shot Log
          </button>
        </div>
      </div>
    </nav>
  )
} 