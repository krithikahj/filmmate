import { useCallback } from 'react'
import { UsernameScreen } from './UsernameScreen'
import './UserSwitchModal.css'

interface UserSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchUser: (newUsername: string) => void
  currentUsername: string | null
}

export function UserSwitchModal({ 
  isOpen, 
  onClose, 
  onSwitchUser, 
  currentUsername 
}: UserSwitchModalProps) {
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div 
      className="user-switch-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-switch-title"
      aria-describedby="user-switch-description"
    >
      <div className="user-switch-container">
        <div className="user-switch-header">
          <h2 id="user-switch-title">Switch User</h2>
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="Close user switch dialog"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        
        <div className="current-user-info">
          <p id="user-switch-description">
            Currently logged in as: <strong>{currentUsername}</strong>
          </p>
        </div>
        
        <div className="username-screen-wrapper">
          <UsernameScreen onUsernameSet={onSwitchUser} />
        </div>
      </div>
    </div>
  )
} 