
import './Navigation.css'

export type Screen = 'settings' | 'generated' | 'logs'

interface NavigationProps {
  currentScreen: Screen
  onScreenChange: (screen: Screen) => void
  canShowGenerated: boolean
  onSwitchUser: () => void
  currentUsername: string | null
}

export function Navigation({ 
  currentScreen, 
  onScreenChange, 
  canShowGenerated, 
  onSwitchUser,
  currentUsername 
}: NavigationProps) {
  const handleUserSwitchClick = () => {
    onSwitchUser()
  }

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <div className="nav-tabs" role="tablist">
          <button
            className={`nav-tab ${currentScreen === 'settings' ? 'active' : ''}`}
            onClick={() => onScreenChange('settings')}
            role="tab"
            aria-selected={currentScreen === 'settings'}
            aria-controls="settings-panel"
          >
            Settings
          </button>
          <button
            className={`nav-tab ${currentScreen === 'generated' ? 'active' : ''}`}
            onClick={() => onScreenChange('generated')}
            disabled={!canShowGenerated}
            role="tab"
            aria-selected={currentScreen === 'generated'}
            aria-controls="generated-panel"
          >
            Results
          </button>
          <button
            className={`nav-tab ${currentScreen === 'logs' ? 'active' : ''}`}
            onClick={() => onScreenChange('logs')}
            role="tab"
            aria-selected={currentScreen === 'logs'}
            aria-controls="logs-panel"
          >
            Shot Log
          </button>
        </div>
        
        <div className="nav-user-section">
          <button
            className="user-switch-btn"
            onClick={handleUserSwitchClick}
            aria-label={`Switch user. Currently logged in as ${currentUsername}`}
            title="Switch User"
          >
            <span className="user-icon" aria-hidden="true">👤</span>
            <span className="current-user">{currentUsername}</span>
            <span className="switch-icon" aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 