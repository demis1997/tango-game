import {
  ACHIEVEMENTS,
  PROFILE_BORDERS,
  PROFILE_ICONS,
  PROFILE_TITLES,
} from '../data/achievements'
import type { Difficulty } from '../engine/types'

const STORAGE_KEY = 'tango-journey-v1'

export interface LevelRecord {
  bestTimeMs: number
  clears: number
  hintsUsedBest: number
}

export interface PlayerProfile {
  name: string
  iconId: string
  borderId: string
  titleId: string
}

export interface GameState {
  highestUnlocked: number // 1-based, next playable up to this
  currentLevel: number
  records: Record<string, LevelRecord> // keyed by level number
  achievements: string[]
  unlockedBorders: string[]
  unlockedTitles: string[]
  profile: PlayerProfile
  streak: number
  noHintClears: number
  randomClears: number
  totalClears: number
}

const defaultState = (): GameState => ({
  highestUnlocked: 1,
  currentLevel: 1,
  records: {},
  achievements: [],
  unlockedBorders: ['plain'],
  unlockedTitles: ['wanderer'],
  profile: {
    name: 'Player',
    iconId: 'sun',
    borderId: 'plain',
    titleId: 'wanderer',
  },
  streak: 0,
  noHintClears: 0,
  randomClears: 0,
  totalClears: 0,
})

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function unlockAchievement(state: GameState, id: string): string[] {
  const newly: string[] = []
  if (state.achievements.includes(id)) return newly

  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) return newly

  state.achievements.push(id)
  newly.push(id)

  if (def.unlockBorder && !state.unlockedBorders.includes(def.unlockBorder)) {
    state.unlockedBorders.push(def.unlockBorder)
  }
  if (def.unlockTitle) {
    const titleId = slug(def.unlockTitle)
    const title = PROFILE_TITLES.find(
      (t) => t.label === def.unlockTitle || t.id === titleId,
    )
    if (title && !state.unlockedTitles.includes(title.id)) {
      state.unlockedTitles.push(title.id)
    }
  }

  return newly
}

function slug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-')
}

export interface ClearResult {
  state: GameState
  isNewBest: boolean
  newAchievements: string[]
}

export function recordLevelClear(
  prev: GameState,
  level: number,
  timeMs: number,
  hintsUsed: number,
  difficulty: Difficulty,
): ClearResult {
  const state: GameState = structuredClone(prev)
  const key = String(level)
  const existing = state.records[key]
  let isNewBest = false

  if (!existing) {
    state.records[key] = {
      bestTimeMs: timeMs,
      clears: 1,
      hintsUsedBest: hintsUsed,
    }
    isNewBest = true
  } else {
    existing.clears += 1
    if (timeMs < existing.bestTimeMs) {
      existing.bestTimeMs = timeMs
      existing.hintsUsedBest = hintsUsed
      isNewBest = true
    }
  }

  if (level >= state.highestUnlocked && level < 1000) {
    state.highestUnlocked = level + 1
  }
  if (level === 1000) {
    state.highestUnlocked = 1000
  }

  state.currentLevel = Math.min(1000, level + 1)
  state.totalClears += 1
  state.streak += 1

  if (hintsUsed === 0) state.noHintClears += 1

  const newly: string[] = []
  const add = (id: string) => newly.push(...unlockAchievement(state, id))

  add('first-clear')
  if (state.highestUnlocked >= 10 || level >= 10) add('level-10')
  if (state.highestUnlocked >= 50 || level >= 50) add('level-50')
  if (state.highestUnlocked >= 100 || level >= 100) add('level-100')
  if (state.highestUnlocked >= 250 || level >= 250) add('level-250')
  if (state.highestUnlocked >= 500 || level >= 500) add('level-500')
  if (state.highestUnlocked >= 750 || level >= 750) add('level-750')
  if (level >= 1000) add('level-1000')

  if (timeMs < 60_000) {
    if (difficulty === 'easy') add('speed-easy')
    if (difficulty === 'medium') add('speed-medium')
    if (difficulty === 'hard') add('speed-hard')
    if (difficulty === 'very-hard') add('speed-very-hard')
  }

  if (state.noHintClears >= 10) add('no-hints-10')
  if (state.streak >= 5) add('streak-5')
  if (isNewBest && existing) add('pb-hunter')

  saveState(state)
  return { state, isNewBest, newAchievements: newly }
}

export function recordRandomClear(prev: GameState): GameState {
  const state: GameState = structuredClone(prev)
  state.randomClears += 1
  state.totalClears += 1
  if (state.randomClears >= 10) {
    unlockAchievement(state, 'random-10')
  }
  saveState(state)
  return state
}

export function updateProfile(
  prev: GameState,
  patch: Partial<PlayerProfile>,
): GameState {
  const state: GameState = {
    ...prev,
    profile: { ...prev.profile, ...patch },
  }
  saveState(state)
  return state
}

export function resetProgress(): GameState {
  const state = defaultState()
  saveState(state)
  return state
}

export function getIcon(id: string) {
  return PROFILE_ICONS.find((i) => i.id === id) ?? PROFILE_ICONS[0]
}

export function getBorder(id: string) {
  return PROFILE_BORDERS.find((b) => b.id === id) ?? PROFILE_BORDERS[0]
}

export function getTitle(id: string) {
  return PROFILE_TITLES.find((t) => t.id === id) ?? PROFILE_TITLES[0]
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const cs = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}
