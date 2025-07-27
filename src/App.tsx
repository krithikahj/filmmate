import React, { useState } from 'react'
import { FilmMateProvider } from './context/FilmMateContext'
import { Navigation, Screen } from './components/Navigation'
import { SettingsScreen } from './components/SettingsScreen'
import { GeneratedSettingsScreen } from './components/GeneratedSettingsScreen'
import { ShotLogScreen } from './components/ShotLogScreen'
import './App.css'

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('settings')
  const [canShowGenerated, setCanShowGenerated] = useState(false)

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  const handleNavigateToResults = () => {
    setCurrentScreen('generated')
    setCanShowGenerated(true)
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