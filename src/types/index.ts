export interface Camera {
  id: string
  name: string
  availableShutterSpeeds: number[]
}

export interface Lens {
  id: string
  name: string
  availableApertures: number[]
}

export interface FilmStock {
  id: string
  name: string
  iso: number
  type: 'Color' | 'Black & White'
  latitude: {
    over: number  // Stops of overexposure tolerance
    under: number // Stops of underexposure tolerance
  }
}

export interface LightingCondition {
  id: string
  name: string
  description: string
  evValue: number
}

export interface ExposureSettings {
  aperture: number
  shutterSpeed: number
  iso: number
  exposureDelta?: number // stops away from target EV (positive = overexposed, negative = underexposed)
}

export interface ShotLog {
  id: string
  timestamp: Date
  camera: Camera
  lens: Lens
  filmStock: FilmStock
  lightingCondition: LightingCondition
  recommendedSettings: ExposureSettings
  alternativeSettings: ExposureSettings[]
  originalSettings: ExposureSettings // The settings before editing
  selectedSettings: ExposureSettings // The final edited settings
  notes?: string
  rating?: number // 1-5 stars, optional
}

// For creating new shot logs (without ID)
export interface CreateShotLog {
  id?: string // Optional - database will generate if not provided
  timestamp: Date
  camera: Camera
  lens: Lens
  filmStock: FilmStock
  lightingCondition: LightingCondition
  recommendedSettings: ExposureSettings
  alternativeSettings: ExposureSettings[]
  originalSettings: ExposureSettings // The settings before editing
  selectedSettings: ExposureSettings // The final edited settings
  notes?: string
  rating?: number
}

export interface AppState {
  selectedCamera: Camera | null
  selectedLens: Lens | null
  selectedFilmStock: FilmStock | null
  selectedLightingCondition: LightingCondition | null
  shotLogs: ShotLog[]
} 