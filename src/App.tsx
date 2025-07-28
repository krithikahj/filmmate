import React, { useState, useEffect } from 'react'
import { FilmMateProvider } from './context/FilmMateContext'
import { Navigation, Screen } from './components/Navigation'
import { SettingsScreen } from './components/SettingsScreen'
import { GeneratedSettingsScreen } from './components/GeneratedSettingsScreen'
import { ShotLogScreen } from './components/ShotLogScreen'
import { UsernameScreen } from './components/UsernameScreen'
import { useFilmMate } from './context/FilmMateContext'
import { testDatabaseConnection } from './services/database'
import './App.css'



// Local storage key for username
const USERNAME_STORAGE_KEY = 'filmate-username'

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('settings')
  const [canShowGenerated, setCanShowGenerated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoadingUsername, setIsLoadingUsername] = useState(true)
  const { setUsername: setContextUsername } = useFilmMate()

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
      // Handle localStorage error silently
    }
  }

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  const handleNavigateToResults = () => {
    setCurrentScreen('generated')
    setCanShowGenerated(true)
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
        {username && (
          <div className="user-info">
            <span className="username-display">Welcome, {username}</span>
          </div>
        )}
      </header>
      
      <Navigation 
        currentScreen={currentScreen}
        onScreenChange={handleScreenChange}
        canShowGenerated={canShowGenerated}
      />
      
      <main>
        {renderCurrentScreen()}
      </main>
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