import { useState, useEffect } from 'react'
import { FilmMateProvider } from './context/FilmMateContext'
import { Navigation, Screen } from './components/Navigation'
import { SettingsScreen } from './components/SettingsScreen'
import { GeneratedSettingsScreen } from './components/GeneratedSettingsScreen'
import { ShotLogScreen } from './components/ShotLogScreen'
import { UsernameScreen } from './components/UsernameScreen'
import { UserSwitchModal } from './components/UserSwitchModal'
import { useFilmMate } from './context/FilmMateContext'
import { testDatabaseConnection } from './services/database'
import { APP_CONSTANTS } from './utils/constants'
import './App.css'

const USERNAME_STORAGE_KEY = APP_CONSTANTS.USERNAME_STORAGE_KEY

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('settings')
  const [canShowGenerated, setCanShowGenerated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoadingUsername, setIsLoadingUsername] = useState(true)
  const [showUserSwitchModal, setShowUserSwitchModal] = useState(false)
  const { setUsername: setContextUsername, clearAllData } = useFilmMate()

  // Load username from localStorage on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test database connection first
        await testDatabaseConnection()
        
        // Load username from localStorage
        const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY)
        if (savedUsername) {
          setUsername(savedUsername)
          setContextUsername(savedUsername)
        }
      } catch (error) {
        console.error('Database connection test failed:', error)
        // Continue with app even if database test fails
      } finally {
        setIsLoadingUsername(false)
      }
    }
    
    initializeApp()
  }, [setContextUsername])

  // Handle username setup
  const handleUsernameSet = (newUsername: string) => {
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, newUsername)
      setUsername(newUsername)
      setContextUsername(newUsername)
    } catch (error) {
      console.error('Failed to save username to localStorage:', error)
    }
  }

  // Handle user switching
  const handleSwitchUser = (newUsername: string) => {
    try {
      // Clear current user's selections and data
      clearAllData()
      
      // Update localStorage
      localStorage.setItem(USERNAME_STORAGE_KEY, newUsername)
      
      // Update state
      setUsername(newUsername)
      setContextUsername(newUsername)
      
      // Reset app state
      setCurrentScreen('settings')
      setCanShowGenerated(false)
      
      // Close modal
      setShowUserSwitchModal(false)
    } catch (error) {
      console.error('Error switching user:', error)
    }
  }

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  const handleNavigateToResults = () => {
    setCurrentScreen('generated')
    setCanShowGenerated(true)
  }

  const handleOpenUserSwitch = () => {
    setShowUserSwitchModal(true)
  }

  const handleCloseUserSwitch = () => {
    setShowUserSwitchModal(false)
  }

  // Show loading state while checking for saved username
  if (isLoadingUsername) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    )
  }

  // Show username screen if no username is set
  if (!username) {
    return (
      <div className="App">
        <UsernameScreen onUsernameSet={handleUsernameSet} />
      </div>
    )
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'settings':
        return (
          <SettingsScreen 
            onReadyToCalculate={() => setCanShowGenerated(true)} 
            onNavigateToResults={handleNavigateToResults}
          />
        )
      case 'generated':
        return <GeneratedSettingsScreen />
      case 'logs':
        return <ShotLogScreen />
      default:
        return (
          <SettingsScreen 
            onReadyToCalculate={() => setCanShowGenerated(true)} 
            onNavigateToResults={handleNavigateToResults}
          />
        )
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>FilmMate</h1>
        <p>Film Photography Exposure Assistant</p>
      </header>
      
      <Navigation 
        currentScreen={currentScreen}
        onScreenChange={handleScreenChange}
        canShowGenerated={canShowGenerated}
        onSwitchUser={handleOpenUserSwitch}
        currentUsername={username}
      />
      
      <main role="main">
        {renderCurrentScreen()}
      </main>

      <UserSwitchModal
        isOpen={showUserSwitchModal}
        onClose={handleCloseUserSwitch}
        onSwitchUser={handleSwitchUser}
        currentUsername={username}
      />
    </div>
  )
}

function App() {
  return (
    <FilmMateProvider>
      <AppContent />
    </FilmMateProvider>
  )
}

export default App 