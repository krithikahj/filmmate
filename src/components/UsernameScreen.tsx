import React, { useState } from 'react'
import { checkUsernameExists, createUsername } from '../services/database'
import './UsernameScreen.css'



// Validation constants
const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 20
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/

interface UsernameScreenProps {
  onUsernameSet: (username: string) => void
}

interface ValidationState {
  isValid: boolean
  message: string
}

export function UsernameScreen({ onUsernameSet }: UsernameScreenProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationState>({ isValid: true, message: '' })
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null)

  // Validate username format
  const validateUsername = (input: string): ValidationState => {
    if (input.length === 0) {
      return { isValid: true, message: '' }
    }

    if (input.length < USERNAME_MIN_LENGTH) {
      return { 
        isValid: false, 
        message: `Username must be at least ${USERNAME_MIN_LENGTH} characters long` 
      }
    }

    if (input.length > USERNAME_MAX_LENGTH) {
      return { 
        isValid: false, 
        message: `Username must be no more than ${USERNAME_MAX_LENGTH} characters long` 
      }
    }

    if (!USERNAME_PATTERN.test(input)) {
      return { 
        isValid: false, 
        message: 'Username can only contain letters, numbers, hyphens, and underscores' 
      }
    }

    return { isValid: true, message: '' }
  }

  // Handle username input change
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = event.target.value
    
    setUsername(newUsername)
    setValidation(validateUsername(newUsername))
    setUsernameExists(null) // Reset existence check when username changes
  }

  // Check if username exists in database
  const checkUsernameAvailability = async (inputUsername: string): Promise<boolean> => {
    try {
      setIsCheckingUsername(true)
      const exists = await checkUsernameExists(inputUsername)
      return exists
    } catch (error) {
      throw error
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validation.isValid) {
      return
    }

    setIsLoading(true)

    try {
      // Check if username exists
      const exists = await checkUsernameAvailability(username)
      setUsernameExists(exists)

      if (exists) {
        // Username exists, proceed to app
        onUsernameSet(username)
      } else {
        // Username doesn't exist, create it
        await createUsername(username)
        onUsernameSet(username)
      }
    } catch (error) {
      
      // Provide more specific error messages
      let errorMessage = 'Failed to set up username. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('Database tables not found')) {
          errorMessage = 'Database not set up. Please contact support.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'Username already exists. Please try a different username.'
        }
      }
      
      setValidation({
        isValid: false,
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key press for accessibility
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && validation.isValid && username.trim()) {
      handleSubmit(event as any)
    }
  }

  // Determine button text based on state
  const getButtonText = (): string => {
    if (isLoading) {
      return 'Setting up...'
    }
    if (isCheckingUsername) {
      return 'Checking...'
    }
    if (usernameExists === true) {
      return 'Continue with existing account'
    }
    if (usernameExists === false) {
      return 'Create new account'
    }
    return 'Continue'
  }

  // Determine if button should be disabled
  const isButtonDisabled = (): boolean => {
    return isLoading || 
           isCheckingUsername || 
           !validation.isValid || 
           !username.trim() ||
           username.length < USERNAME_MIN_LENGTH
  }

  return (
    <div className="username-screen" role="main">
      <div className="username-container">
        <header className="username-header">
          <h1>Welcome to FilmMate</h1>
          <p>Enter a username to access your shot logs</p>
        </header>

        <form onSubmit={handleSubmit} className="username-form" noValidate>
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onKeyPress={handleKeyPress}
              className={`form-input ${validation.isValid ? '' : 'error'}`}
              placeholder="Enter your username"
              aria-describedby="username-help username-error"
              aria-invalid={!validation.isValid}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
            
            {/* Help text */}
            <div id="username-help" className="help-text">
              Username must be {USERNAME_MIN_LENGTH}-{USERNAME_MAX_LENGTH} characters long and can contain letters, numbers, hyphens, and underscores.
            </div>

            {/* Error message */}
            {!validation.isValid && (
              <div id="username-error" className="error-message" role="alert">
                {validation.message}
              </div>
            )}

            {/* Username status */}
            {usernameExists !== null && validation.isValid && username.trim() && (
              <div className="username-status" role="status">
                {usernameExists ? (
                  <span className="status-existing">
                    ✓ This username exists. You can continue with your existing account.
                  </span>
                ) : (
                  <span className="status-new">
                    ✓ This username is available. A new account will be created.
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isButtonDisabled()}
            aria-describedby="button-help"
          >
            {getButtonText()}
          </button>

          <div id="button-help" className="button-help">
            {isButtonDisabled() && !validation.isValid && (
              <span>Please enter a valid username to continue</span>
            )}
            {isButtonDisabled() && validation.isValid && username.length < USERNAME_MIN_LENGTH && (
              <span>Username must be at least {USERNAME_MIN_LENGTH} characters long</span>
            )}
          </div>
        </form>

        <footer className="username-footer">
          <p>
            <small>
              Your shot logs will be saved to the cloud and accessible from any device using this username.
            </small>
          </p>
        </footer>
      </div>
    </div>
  )
} 