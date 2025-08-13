import { createClient } from '@supabase/supabase-js'
import { Camera, Lens, FilmStock, LightingCondition, ExposureSettings, ShotLog, CreateShotLog } from '../types'
import { DATABASE_CONSTANTS } from '../utils/constants'

// Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)



// Database table names
const TABLES = DATABASE_CONSTANTS.TABLES
const SUPABASE_ERROR_CODES = DATABASE_CONSTANTS.SUPABASE_ERROR_CODES

// Types for database operations

interface DatabaseShotLog {
  id: string
  username: string
  timestamp: string
  camera: Camera
  lens: Lens
  film_stock: FilmStock
  lighting_condition: LightingCondition
  recommended_settings: ExposureSettings
  alternative_settings: ExposureSettings[]
  original_settings: ExposureSettings // Settings before editing
  selected_settings: ExposureSettings // Final edited settings
  notes?: string
  rating?: number
  created_at: string
}

/**
 * Check if a username already exists in the database
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('username')
    .eq('username', username)
    .single()

  if (error && error.code !== SUPABASE_ERROR_CODES.NOT_FOUND) { // PGRST116 is "not found" error
    throw error
  }

  const exists = !!data
  return exists
}

/**
 * Create a new username in the database
 */
export async function createUsername(username: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.USERS)
    .insert([{ username }])

  if (error) {
    throw error
  }
}

/**
 * Save a shot log to the database
 */
export async function saveShotLog(username: string, shotLog: CreateShotLog): Promise<void> {
  // Validate required fields
  if (!shotLog.camera || !shotLog.lens || !shotLog.filmStock || !shotLog.lightingCondition) {
    throw new Error('Missing required shot log data')
  }
  
  const dbShotLog: Omit<DatabaseShotLog, 'id'> = {
    username,
    timestamp: shotLog.timestamp.toISOString(),
    camera: shotLog.camera,
    lens: shotLog.lens,
    film_stock: shotLog.filmStock,
    lighting_condition: shotLog.lightingCondition,
    recommended_settings: shotLog.recommendedSettings,
    alternative_settings: shotLog.alternativeSettings,
    original_settings: shotLog.originalSettings,
    selected_settings: shotLog.selectedSettings,
    notes: shotLog.notes,
    rating: shotLog.rating,
    created_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from(TABLES.SHOT_LOGS)
    .insert([dbShotLog])

  if (error) {
    throw error
  }
}

/**
 * Update an existing shot log in the database
 */
export async function updateShotLog(username: string, shotLog: ShotLog): Promise<void> {
  const dbShotLog: Partial<DatabaseShotLog> = {
    timestamp: shotLog.timestamp.toISOString(),
    camera: shotLog.camera,
    lens: shotLog.lens,
    film_stock: shotLog.filmStock,
    lighting_condition: shotLog.lightingCondition,
    recommended_settings: shotLog.recommendedSettings,
    alternative_settings: shotLog.alternativeSettings,
    original_settings: shotLog.originalSettings,
    selected_settings: shotLog.selectedSettings,
    notes: shotLog.notes,
    rating: shotLog.rating
  }

  const { error } = await supabase
    .from(TABLES.SHOT_LOGS)
    .update(dbShotLog)
    .eq('id', shotLog.id)
    .eq('username', username)

  if (error) {
    throw error
  }
}

/**
 * Load all shot logs for a username from the database
 */
export async function loadShotLogs(username: string): Promise<ShotLog[]> {
  const { data, error } = await supabase
    .from(TABLES.SHOT_LOGS)
    .select('*')
    .eq('username', username)
    .order('timestamp', { ascending: false })

  if (error) {
    throw error
  }

  const shotLogs: ShotLog[] = (data || []).map((dbLog: DatabaseShotLog) => ({
    id: dbLog.id,
    timestamp: new Date(dbLog.timestamp),
    camera: dbLog.camera,
    lens: dbLog.lens,
    filmStock: dbLog.film_stock,
    lightingCondition: dbLog.lighting_condition,
    recommendedSettings: dbLog.recommended_settings,
    alternativeSettings: dbLog.alternative_settings,
    originalSettings: dbLog.original_settings,
    selectedSettings: dbLog.selected_settings,
    notes: dbLog.notes,
    rating: dbLog.rating
  }))

  return shotLogs
}

/**
 * Delete a shot log from the database
 */
export async function deleteShotLog(username: string, logId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.SHOT_LOGS)
    .delete()
    .eq('id', logId)
    .eq('username', username)

  if (error) {
    throw error
  }
}

/**
 * Initialize database tables (for development)
 * This function creates the necessary tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  // Note: In a real application, you would use Supabase migrations
  // For now, we'll just provide the required schema
  
  // Please create the following tables in your Supabase dashboard:
  // 1. users table with columns: username (text, primary key), created_at (timestamp)
  // 2. shot_logs table with columns: id (uuid, primary key), username (text, foreign key), timestamp (timestamp), camera (jsonb), lens (jsonb), film_stock (jsonb), lighting_condition (jsonb), recommended_settings (jsonb), alternative_settings (jsonb), selected_settings (jsonb), notes (text), rating (integer), created_at (timestamp)
}

/**
 * Test database connection and log current status
 */
export async function testDatabaseConnection(): Promise<void> {
  // Test a simple query to check connection
  const { error } = await supabase
    .from(TABLES.USERS)
    .select('count')
    .limit(1)
  
  if (error) {
    // Check if it's a table doesn't exist error
    if (error.message && error.message.includes('relation "users" does not exist')) {
      throw new Error('Database tables not found. Please create the users and shot_logs tables in your Supabase dashboard.')
    }
    throw error
  }
  
  // Also test the shot_logs table
  const { error: shotLogsError } = await supabase
    .from(TABLES.SHOT_LOGS)
    .select('count')
    .limit(1)
  
  if (shotLogsError) {
    if (shotLogsError.message && shotLogsError.message.includes('relation "shot_logs" does not exist')) {
      throw new Error('Shot logs table not found. Please create the shot_logs table in your Supabase dashboard.')
    }
    throw shotLogsError
  }
} 