import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { AppState, Camera, Lens, FilmStock, LightingCondition, ShotLog } from '../types'
import { ExposureCalculator, ExposureCalculationResult } from '../utils/exposureCalculator'

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
  setCamera: (camera: Camera) => void
  setLens: (lens: Lens) => void
  setFilmStock: (filmStock: FilmStock) => void
  setLightingCondition: (lightingCondition: LightingCondition) => void
  addShotLog: (shotLog: ShotLog) => void
  updateShotLog: (shotLog: ShotLog) => void
  loadShotLogs: (shotLogs: ShotLog[]) => void
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
  const exposureCalculator = new ExposureCalculator()

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

  const addShotLog = useCallback((shotLog: ShotLog) => {
    dispatch({ type: 'ADD_SHOT_LOG', payload: shotLog })
    // Save to localStorage
    const existingLogs = JSON.parse(localStorage.getItem('filmate-shot-logs') || '[]')
    const updatedLogs = [shotLog, ...existingLogs]
    localStorage.setItem('filmate-shot-logs', JSON.stringify(updatedLogs))
  }, [])

  const updateShotLog = useCallback((shotLog: ShotLog) => {
    dispatch({ type: 'UPDATE_SHOT_LOG', payload: shotLog })
    // Update localStorage
    const existingLogs = JSON.parse(localStorage.getItem('filmate-shot-logs') || '[]')
    const updatedLogs = existingLogs.map((log: any) => 
      log.id === shotLog.id ? shotLog : log
    )
    localStorage.setItem('filmate-shot-logs', JSON.stringify(updatedLogs))
  }, [])

  const loadShotLogs = useCallback((shotLogs: ShotLog[]) => {
    dispatch({ type: 'LOAD_SHOT_LOGS', payload: shotLogs })
  }, [])

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