export type SymbolStyle = 'celestial' | 'geometric'
export type ValidationMode = 'relaxed' | 'live'

export interface UserSettings {
  symbolStyle: SymbolStyle
  validationMode: ValidationMode
  sound: boolean
  highContrast: boolean
  reducedMotion: boolean
  tutorialDone: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  symbolStyle: 'celestial',
  validationMode: 'relaxed',
  sound: false,
  highContrast: false,
  reducedMotion: false,
  tutorialDone: false,
}
