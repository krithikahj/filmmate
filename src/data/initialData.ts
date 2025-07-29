import { Camera, Lens, FilmStock, LightingCondition } from '../types'

export const initialCameras: Camera[] = [
  {
    id: 'canon-ae1',
    name: 'Canon AE-1',
    availableShutterSpeeds: [1000, 500, 250, 125, 60, 30, 15, 8, 4, 2, 1, 0.5]
  }
]

export const initialLenses: Lens[] = [
  {
    id: 'canon-fd-50mm-f1.8',
    name: 'Canon FD 50mm f/1.8',
    availableApertures: [1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
  },
  {
    id: 'canon-fd-85mm-f1.8',
    name: 'Canon FD 85mm f/1.8',
    availableApertures: [1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
  },
  {
    id: 'canon-fd-28mm-f2.8',
    name: 'Canon FD 28mm f/2.8',
    availableApertures: [2.8, 4, 5.6, 8, 11, 16, 22]
  },
  {
    id: 'canon-fd-35mm-f3.5-sc',
    name: 'Canon FD 35mm f/3.5 SC',
    availableApertures: [3.5, 4, 5.6, 8, 11, 16, 22]
  }
]

export const initialFilmStocks: FilmStock[] = [
  {
    id: 'fujifilm-c200',
    name: 'Fujifilm C200',
    iso: 200,
    type: 'Color',
    latitude: {
      over: 2,
      under: 1
    }
  },
  {
    id: 'kodak-portra-400',
    name: 'Kodak Portra 400',
    iso: 400,
    type: 'Color',
    latitude: {
      over: 3,
      under: 1.5
    }
  },
  {
    id: 'kodak-portra-800',
    name: 'Kodak Portra 800',
    iso: 800,
    type: 'Color',
    latitude: {
      over: 3.5,
      under: 1.5
    }
  },
  {
    id: 'ilford-hp5-plus',
    name: 'Ilford HP5 Plus',
    iso: 400,
    type: 'Black & White',
    latitude: {
      over: 4,
      under: 2
    }
  },
  {
    id: 'kodak-tri-x-400',
    name: 'Kodak Tri-X 400',
    iso: 400,
    type: 'Black & White',
    latitude: {
      over: 5,
      under: 2.5
    }
  }
]

export const initialLightingConditions: LightingCondition[] = [
  {
    id: 'bright-sun',
    name: 'Bright Sun',
    description: 'Clear sky, bright sunlight',
    evValue: 15
  },
  {
    id: 'open-shade',
    name: 'Open Shade',
    description: 'Shaded area on sunny day',
    evValue: 13
  },
  {
    id: 'overcast',
    name: 'Overcast',
    description: 'Cloudy day, no shadows',
    evValue: 12
  },
  {
    id: 'heavy-overcast',
    name: 'Heavy Overcast',
    description: 'Very cloudy, low light',
    evValue: 10
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Golden hour lighting',
    evValue: 8
  },
  {
    id: 'indoor-bright',
    name: 'Indoor Bright',
    description: 'Well-lit indoor space',
    evValue: 9
  },
  {
    id: 'indoor-dim',
    name: 'Indoor Dim',
    description: 'Dim indoor lighting',
    evValue: 6
  }
] 