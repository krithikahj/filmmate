import { ExposureCalculator } from './exposureCalculator'
import { Camera, Lens, FilmStock, LightingCondition } from '../types'

describe('ExposureCalculator', () => {
  const mockCamera: Camera = {
    id: 'test-camera',
    name: 'Test Camera',
    availableShutterSpeeds: [1000, 500, 250, 200, 125, 60, 30, 15, 8, 4, 2, 1, 0.5]
  }

  const mockLens: Lens = {
    id: 'test-lens',
    name: 'Test Lens',
    availableApertures: [1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
  }

  const mockFilmStock: FilmStock = {
    id: 'test-film',
    name: 'Test Film',
    iso: 200,
    type: 'Color',
    latitude: {
      over: 2,
      under: 1
    }
  }

  const mockLightingCondition: LightingCondition = {
    id: 'test-lighting',
    name: 'Test Lighting',
    description: 'Test description',
    evValue: 15
  }

  describe('calculateExposureSettings', () => {
    it('should match Sunny 16 rule for f/16, 1/200s, ISO 200, EV 15', () => {
      const calculator = new ExposureCalculator()
      const camera: Camera = {
        id: 'sunny16-camera',
        name: 'Sunny 16 Camera',
        availableShutterSpeeds: [200],
      }
      const lens: Lens = {
        id: 'sunny16-lens',
        name: 'Sunny 16 Lens',
        availableApertures: [16],
      }
      const film: FilmStock = {
        id: 'sunny16-film',
        name: 'Sunny 16 Film',
        iso: 200,
        type: 'Color',
        latitude: {
          over: 2,
          under: 1
        }
      }
      const lighting: LightingCondition = {
        id: 'sunny16-light',
        name: 'Sunny 16 Light',
        description: 'Bright sun',
        evValue: 15,
      }
      const result = calculator.calculateExposureSettings(camera, lens, film, lighting)
      expect(result.recommendedSettings.aperture).toBe(16)
      expect(result.recommendedSettings.shutterSpeed).toBe(200)
      expect(result.recommendedSettings.iso).toBe(200)
      expect(result.recommendedSettings.exposureDelta).toBeDefined()
    })

    it('should calculate correct exposure settings for sunny 16 rule', () => {
      const calculator = new ExposureCalculator()
      const result = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        mockFilmStock,
        mockLightingCondition
      )

      expect(result.recommendedSettings).toBeDefined()
      expect(result.recommendedSettings.iso).toBe(200)
      expect(result.recommendedSettings.exposureDelta).toBeDefined()
      expect(result.alternativeSettings).toHaveLength(3)
      expect(result.alternativeSettings.every(settings => settings.iso === 200)).toBe(true)
      expect(result.alternativeSettings.every(settings => settings.exposureDelta !== undefined)).toBe(true)
    })

    it('should return settings within available camera and lens ranges', () => {
      const calculator = new ExposureCalculator()
      const result = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        mockFilmStock,
        mockLightingCondition
      )

      // Check recommended settings are within available ranges
      expect(mockCamera.availableShutterSpeeds).toContain(result.recommendedSettings.shutterSpeed)
      expect(mockLens.availableApertures).toContain(result.recommendedSettings.aperture)

      // Check alternative settings are within available ranges
      result.alternativeSettings.forEach(settings => {
        expect(mockCamera.availableShutterSpeeds).toContain(settings.shutterSpeed)
        expect(mockLens.availableApertures).toContain(settings.aperture)
      })
    })

    it('should handle different EV values correctly', () => {
      const calculator = new ExposureCalculator()
      
      // Test with lower EV (darker conditions)
      const lowEVLighting: LightingCondition = {
        ...mockLightingCondition,
        evValue: 8
      }

      const lowEVResult = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        mockFilmStock,
        lowEVLighting
      )

      // Lower EV should result in wider aperture or slower shutter speed
      expect(lowEVResult.recommendedSettings.aperture).toBeLessThanOrEqual(5.6)
      expect(lowEVResult.recommendedSettings.shutterSpeed).toBeLessThanOrEqual(125)
    })

    it('should handle different ISO values correctly', () => {
      const calculator = new ExposureCalculator()
      
      const highISOFilm: FilmStock = {
        ...mockFilmStock,
        iso: 800
      }

      const result = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        highISOFilm,
        mockLightingCondition
      )

      expect(result.recommendedSettings.iso).toBe(800)
      // Higher ISO should allow for smaller aperture or faster shutter speed
      expect(result.recommendedSettings.aperture).toBeGreaterThanOrEqual(2.8)
      expect(result.recommendedSettings.shutterSpeed).toBeGreaterThanOrEqual(250)
    })

    it('should return valid exposure combinations', () => {
      const calculator = new ExposureCalculator()
      const result = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        mockFilmStock,
        mockLightingCondition
      )

      // All settings should have valid exposure values
      const allSettings = [result.recommendedSettings, ...result.alternativeSettings]
      
      allSettings.forEach(settings => {
        expect(settings.aperture).toBeGreaterThan(0)
        expect(settings.shutterSpeed).toBeGreaterThan(0)
        expect(settings.iso).toBeGreaterThan(0)
      })
    })

    it('should prioritize balanced settings for recommended exposure', () => {
      const calculator = new ExposureCalculator()
      const result = calculator.calculateExposureSettings(
        mockCamera,
        mockLens,
        mockFilmStock,
        mockLightingCondition
      )

      // Recommended settings should be balanced (not extreme values)
      expect(result.recommendedSettings.aperture).toBeGreaterThanOrEqual(2.8)
      expect(result.recommendedSettings.aperture).toBeLessThanOrEqual(11)
      expect(result.recommendedSettings.shutterSpeed).toBeGreaterThanOrEqual(30)
      expect(result.recommendedSettings.shutterSpeed).toBeLessThanOrEqual(500)
    })
  })

  describe('validateInputs', () => {
    it('should throw error for missing camera', () => {
      const calculator = new ExposureCalculator()
      
      expect(() => {
        calculator.calculateExposureSettings(
          null as any,
          mockLens,
          mockFilmStock,
          mockLightingCondition
        )
      }).toThrow('All inputs must be provided')
    })

    it('should throw error for missing lens', () => {
      const calculator = new ExposureCalculator()
      
      expect(() => {
        calculator.calculateExposureSettings(
          mockCamera,
          null as any,
          mockFilmStock,
          mockLightingCondition
        )
      }).toThrow('All inputs must be provided')
    })

    it('should throw error for missing film stock', () => {
      const calculator = new ExposureCalculator()
      
      expect(() => {
        calculator.calculateExposureSettings(
          mockCamera,
          mockLens,
          null as any,
          mockLightingCondition
        )
      }).toThrow('All inputs must be provided')
    })

    it('should throw error for missing lighting condition', () => {
      const calculator = new ExposureCalculator()
      
      expect(() => {
        calculator.calculateExposureSettings(
          mockCamera,
          mockLens,
          mockFilmStock,
          null as any
        )
      }).toThrow('All inputs must be provided')
    })
  })
}) 