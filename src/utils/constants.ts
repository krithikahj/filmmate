// Application Constants
export const APP_CONSTANTS = {
  USERNAME_STORAGE_KEY: 'filmmate_username',
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NOTES_MAX_LENGTH: 500
} as const

// Exposure Calculation Constants
export const EXPOSURE_CONSTANTS = {
  TOLERANCE: 2.0, // Allow for realistic tolerance in photographic calculations
  ISO_BASE_VALUE: 100, // Base ISO for calculations
  PREFERRED_SHUTTER_MIN: 30, // Prefer shutter speeds >= 1/30
  PREFERRED_SHUTTER_MAX: 500, // Prefer shutter speeds <= 1/500
  ACCEPTABLE_SHUTTER_MIN: 15, // Acceptable shutter speeds >= 1/15
  ACCEPTABLE_SHUTTER_MAX: 1000 // Acceptable shutter speeds <= 1/1000
} as const

// Database Constants
export const DATABASE_CONSTANTS = {
  TABLES: {
    USERS: 'users',
    SHOT_LOGS: 'shot_logs'
  },
  SUPABASE_ERROR_CODES: {
    NOT_FOUND: 'PGRST116'
  }
} as const

// UI Constants
export const UI_CONSTANTS = {
  LOADING_DELAY: 1000, // ms
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 500 // ms
} as const 