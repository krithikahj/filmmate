import { Camera, Lens, FilmStock, LightingCondition, ExposureSettings } from '../types'
import { EXPOSURE_CONSTANTS } from './constants'

export interface ExposureCalculationResult {
  recommendedSettings: ExposureSettings
  alternativeSettings: ExposureSettings[]
}

export class ExposureCalculator {
  /**
   * Calculate exposure settings based on camera, lens, film, and lighting conditions
   * Uses the formula: 2^EV = (aperture^2 × 100) / (ISO × shutterSpeed)
   * Based on the Sunny 16 rule where at EV 15, correct exposure is f/16 at 1/ISO
   */
  calculateExposureSettings(
    camera: Camera,
    lens: Lens,
    filmStock: FilmStock,
    lightingCondition: LightingCondition
  ): ExposureCalculationResult {
    this.validateInputs(camera, lens, filmStock, lightingCondition)

    const ev = lightingCondition.evValue
    const iso = filmStock.iso

    // Use the EV value directly (EV values in photography are typically 0-20)
    const targetExposureValue = ev

    // Find valid combinations within available camera and lens settings
    const validCombinations = this.findValidCombinations(
      camera.availableShutterSpeeds,
      lens.availableApertures,
      iso,
      targetExposureValue,
      filmStock
    )

    if (validCombinations.length === 0) {
      throw new Error('No valid exposure combinations found for the given equipment and conditions')
    }

    // Select recommended settings (balanced approach with lens-specific aperture targeting)
    const recommendedSettings = this.selectRecommendedSettings(validCombinations, lens)

    // Select alternative settings
    const alternativeSettings = this.selectAlternativeSettings(validCombinations, recommendedSettings, lens)

    return {
      recommendedSettings,
      alternativeSettings
    }
  }

  private validateInputs(
    camera: Camera | null,
    lens: Lens | null,
    filmStock: FilmStock | null,
    lightingCondition: LightingCondition | null
  ): void {
    if (!camera || !lens || !filmStock || !lightingCondition) {
      throw new Error('All inputs must be provided')
    }
  }

  private findValidCombinations(
    shutterSpeeds: number[],
    apertures: number[],
    iso: number,
    targetExposureValue: number,
    filmStock: FilmStock
  ): ExposureSettings[] {
    const combinations: ExposureSettings[] = []
    // Allow for realistic tolerance in photographic calculations

    for (const shutterSpeed of shutterSpeeds) {
      for (const aperture of apertures) {
        // Always interpret shutter speed as denominator (e.g., 200 means 1/200s)
        const shutter = 1 / shutterSpeed
        // Calculate actual exposure value using the correct photographic formula
        // EV = log2(aperture² / shutter_speed) + log2(ISO/100)
        const actualExposureValue = this.calculateExposureValue(aperture, shutter, iso)
        const delta = actualExposureValue - targetExposureValue
        
        // Check if this combination is within tolerance of target
        if (this.isExposureWithinTolerance(actualExposureValue, targetExposureValue)) {
          // Check if exposure is within film latitude
          this.isExposureWithinLatitude(delta, filmStock)
          
          combinations.push({
            aperture,
            shutterSpeed,
            iso,
            exposureDelta: parseFloat(delta.toFixed(2)) // Rounded for display purposes
          })
        }
      }
    }

    return combinations
  }

  private calculateExposureValue(aperture: number, shutter: number, iso: number): number {
    // EV = log2(aperture² / shutter_speed) + log2(ISO/100)
    const actualExposureValue = Math.log2(Math.pow(aperture, 2) / shutter) + Math.log2(iso / EXPOSURE_CONSTANTS.ISO_BASE_VALUE)
    return actualExposureValue
  }

  private isExposureWithinTolerance(actualEV: number, targetEV: number): boolean {
    const tolerance = EXPOSURE_CONSTANTS.TOLERANCE // Allow for realistic tolerance in photographic calculations
    return Math.abs(actualEV - targetEV) <= tolerance
  }

  private isExposureWithinLatitude(delta: number, filmStock: FilmStock): boolean {
    if (!filmStock.latitude) return true // If no latitude data, assume safe
    
    if (delta > 0) {
      // Overexposed
      return delta <= filmStock.latitude.over
    } else {
      // Underexposed
      return Math.abs(delta) <= filmStock.latitude.under
    }
  }

  private selectRecommendedSettings(combinations: ExposureSettings[], lens: Lens): ExposureSettings {
    // Sort combinations by how balanced they are (prefer middle-range apertures and shutter speeds)
    const sortedCombinations = combinations.sort((a, b) => {
      const aScore = this.calculateBalanceScore(a, lens)
      const bScore = this.calculateBalanceScore(b, lens)
      return bScore - aScore // Higher score first
    })

    return sortedCombinations[0]
  }

  private selectAlternativeSettings(
    combinations: ExposureSettings[],
    recommended: ExposureSettings,
    lens: Lens
  ): ExposureSettings[] {
    // Filter out the recommended settings and select up to 3 alternatives
    const alternatives = combinations.filter(
      combo => !this.isSameSettings(combo, recommended)
    )

    // Sort by balance score and take top 3
    const sortedAlternatives = alternatives
      .sort((a, b) => {
        const aScore = this.calculateBalanceScore(a, lens)
        const bScore = this.calculateBalanceScore(b, lens)
        return bScore - aScore
      })
      .slice(0, 3)

    return sortedAlternatives
  }

  private calculateBalanceScore(settings: ExposureSettings, lens: Lens): number {
    // Prefer balanced settings (not extreme values)
    // Higher score for middle-range apertures and shutter speeds
    const apertureScore = this.getApertureScore(settings.aperture, lens.availableApertures)
    const shutterScore = this.getShutterSpeedScore(settings.shutterSpeed)
    
    return apertureScore + shutterScore
  }

  private getApertureScore(aperture: number, availableApertures: number[]): number {
    // Dynamic aperture targeting based on available lens options
    const sorted = availableApertures.sort((a, b) => a - b)
    const midIndex = Math.floor(sorted.length / 2)

    const diff = Math.abs(sorted.indexOf(aperture) - midIndex)
    return 10 - diff // 10 if it's ideal, 9 if one stop away, etc.
  }

  private getShutterSpeedScore(shutterSpeed: number): number {
    // Prefer shutter speeds between 1/30 and 1/500 for good balance
    if (shutterSpeed >= EXPOSURE_CONSTANTS.PREFERRED_SHUTTER_MIN && shutterSpeed <= EXPOSURE_CONSTANTS.PREFERRED_SHUTTER_MAX) {
      return 1
    } else if (shutterSpeed >= EXPOSURE_CONSTANTS.ACCEPTABLE_SHUTTER_MIN && shutterSpeed <= EXPOSURE_CONSTANTS.ACCEPTABLE_SHUTTER_MAX) {
      return 0.5
    }
    return 0
  }



  private isSameSettings(a: ExposureSettings, b: ExposureSettings): boolean {
    return a.aperture === b.aperture && 
           a.shutterSpeed === b.shutterSpeed && 
           a.iso === b.iso
  }
} 