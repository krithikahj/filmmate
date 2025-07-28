import React, { createContext, useContext, useReducer, ReactNode, useCallback, useState, useEffect } from 'react'
import { AppState, Camera, Lens, FilmStock, LightingCondition, ShotLog, CreateShotLog } from '../types'
import { ExposureCalculator, ExposureCalculationResult } from '../utils/exposureCalculator'
import { saveShotLog, updateShotLog as updateShotLogInDB, loadShotLogs as loadShotLogsFromDB } from '../services/database'



// Initial state
const initialState: AppState = {
  selectedCamera: null,
  selectedLens: null,
  selectedFilmStock: null,
  selectedLightingCondition: null,
  shotLogs: []
}

// Action types
type Action =
  | { type: 'SET_CAMERA'; payload: Camera }
  | { type: 'SET_LENS'; payload: Lens }
  | { type: 'SET_FILM_STOCK'; payload: FilmStock }
  | { type: 'SET_LIGHTING_CONDITION'; payload: LightingCondition }
  | { type: 'ADD_SHOT_LOG'; payload: ShotLog }
  | { type: 'UPDATE_SHOT_LOG'; payload: ShotLog }
  | { type: 'LOAD_SHOT_LOGS'; payload: ShotLog[] }
  | { type: 'CLEAR_SELECTIONS' }

// Reducer function
function filmMateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CAMERA':
      return { ...state, selectedCamera: action.payload }
    case 'SET_LENS':
      return { ...state, selectedLens: action.payload }
    case 'SET_FILM_STOCK':
      return { ...state, selectedFilmStock: action.payload }
    case 'SET_LIGHTING_CONDITION':
      return { ...state, selectedLightingCondition: action.payload }
    case 'ADD_SHOT_LOG':
      return { ...state, shotLogs: [action.payload, ...state.shotLogs] }
    case 'UPDATE_SHOT_LOG':
      return {
        ...state,
        shotLogs: state.shotLogs.map(log => 
          log.id === action.payload.id ? action.payload : log
        )
      }
    case 'LOAD_SHOT_LOGS':
      return { ...state, shotLogs: action.payload }
    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedCamera: null,
        selectedLens: null,
        selectedFilmStock: null,
        selectedLightingCondition: null
      }
    default:
      return state
  }
}

// Context interface
interface FilmMateContextType {
  state: AppState
  username: string | null
  setUsername: (username: string) => void
  setCamera: (camera: Camera) => void
  setLens: (lens: Lens) => void
  setFilmStock: (filmStock: FilmStock) => void
  setLightingCondition: (lightingCondition: LightingCondition) => void
  addShotLog: (shotLog: CreateShotLog) => Promise<void>
  updateShotLog: (shotLog: ShotLog) => Promise<void>
  loadShotLogs: () => Promise<void>
  clearSelections: () => void
  calculateExposure: () => ExposureCalculationResult | null
  isReadyToCalculate: () => boolean
}

// Create context
const FilmMateContext = createContext<FilmMateContextType | undefined>(undefined)

// Provider component
interface FilmMateProviderProps {
  children: ReactNode
}

export function FilmMateProvider({ children }: FilmMateProviderProps) {
  const [state, dispatch] = useReducer(filmMateReducer, initialState)
  const [username, setUsernameState] = useState<string | null>(null)
  const exposureCalculator = new ExposureCalculator()

  // Debug provider mount
  useEffect(() => {
    // Component mounted
  }, [])

  // Action creators
  const setCamera = useCallback((camera: Camera) => {
    dispatch({ type: 'SET_CAMERA', payload: camera })
  }, [])

  const setLens = useCallback((lens: Lens) => {
    dispatch({ type: 'SET_LENS', payload: lens })
  }, [])

  const setFilmStock = useCallback((filmStock: FilmStock) => {
    dispatch({ type: 'SET_FILM_STOCK', payload: filmStock })
  }, [])

  const setLightingCondition = useCallback((lightingCondition: LightingCondition) => {
    dispatch({ type: 'SET_LIGHTING_CONDITION', payload: lightingCondition })
  }, [])

  // Set username for database operations
  const setUsername = useCallback((newUsername: string) => {
    setUsernameState(newUsername)
  }, [])

  const addShotLog = useCallback(async (shotLog: CreateShotLog) => {
    if (!username) {
      throw new Error('Username not set')
    }

    try {
      // Generate a temporary ID for local state if not provided
      const shotLogWithId: ShotLog = {
        ...shotLog,
        id: shotLog.id || `temp-${Date.now()}`
      }
      
      // Update local state immediately for responsive UI
      dispatch({ type: 'ADD_SHOT_LOG', payload: shotLogWithId })
      
      // Save to database
      await saveShotLog(username, shotLog)
    } catch (error) {
      // Revert local state on error
      dispatch({ type: 'LOAD_SHOT_LOGS', payload: state.shotLogs })
      throw error
    }
  }, [username, state.shotLogs])

  const updateShotLog = useCallback(async (shotLog: ShotLog) => {
    if (!username) {
      throw new Error('Username not set')
    }

    try {
      // Update local state immediately for responsive UI
      dispatch({ type: 'UPDATE_SHOT_LOG', payload: shotLog })
      
      // Update in database
      await updateShotLogInDB(username, shotLog)
    } catch (error) {
      // Revert local state on error
      dispatch({ type: 'LOAD_SHOT_LOGS', payload: state.shotLogs })
      throw error
    }
  }, [username, state.shotLogs])

  const loadShotLogs = useCallback(async () => {
    if (!username) {
      return
    }

    try {
      const shotLogs = await loadShotLogsFromDB(username)
      dispatch({ type: 'LOAD_SHOT_LOGS', payload: shotLogs })
    } catch (error) {
      throw error
    }
  }, [username])

  const clearSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTIONS' })
  }, [])

  // Calculate exposure if all inputs are selected
  const calculateExposure = useCallback((): ExposureCalculationResult | null => {
    if (!isReadyToCalculate()) {
      return null
    }

    try {
      return exposureCalculator.calculateExposureSettings(
        state.selectedCamera!,
        state.selectedLens!,
        state.selectedFilmStock!,
        state.selectedLightingCondition!
      )
    } catch (error) {
      console.error('Error calculating exposure:', error)
      return null
    }
  }, [state.selectedCamera, state.selectedLens, state.selectedFilmStock, state.selectedLightingCondition])

  // Check if all required inputs are selected
  const isReadyToCalculate = useCallback((): boolean => {
    return !!(
      state.selectedCamera &&
      state.selectedLens &&
      state.selectedFilmStock &&
      state.selectedLightingCondition
    )
  }, [state.selectedCamera, state.selectedLens, state.selectedFilmStock, state.selectedLightingCondition])

  const value: FilmMateContextType = {
    state,
    username,
    setUsername,
    setCamera,
    setLens,
    setFilmStock,
    setLightingCondition,
    addShotLog,
    updateShotLog,
    loadShotLogs,
    clearSelections,
    calculateExposure,
    isReadyToCalculate
  }

  return (
    <FilmMateContext.Provider value={value}>
      {children}
    </FilmMateContext.Provider>
  )
}

// Custom hook to use the context
export function useFilmMate() {
  const context = useContext(FilmMateContext)
  if (context === undefined) {
    throw new Error('useFilmMate must be used within a FilmMateProvider')
  }
  return context
} 