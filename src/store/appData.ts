import type { CellValue, Difficulty } from '../engine/types'
import { dateKey } from '../engine/seeds'
import { ACHIEVEMENTS } from '../data/achievements'
import { CAMPAIGN_LEVELS } from '../engine/campaign'
import { DEFAULT_SETTINGS, type UserSettings } from './settings'

const ROOT = 'tango-v2'

export type ThemeMode = 'light' | 'dark'

export interface PuzzleSession {
  seed: string
  grid: CellValue[][]
  history: CellValue[][][]
  historyIndex: number
  elapsedMs: number
  started: boolean
  completed: boolean
  hintsUsed: number
  mistakes: number
  updatedAt: number
}

export interface DailyRecord {
  dateKey: string
  seed: string
  completed: boolean
  timeMs?: number
  hintsUsed?: number
  mistakes?: number
}

export interface UnlimitedStats {
  solved: number
  byDifficulty: Record<Difficulty, number>
  bestTimeMs: Partial<Record<Difficulty, number>>
  totalTimeMs: number
}

export interface CampaignRecord {
  bestTimeMs: number
  clears: number
  hintsUsedBest: number
}

export interface PlayerProfile {
  name: string
  avatarId: string
  borderId: string
  titleId: string
}

export interface AppData {
  theme: ThemeMode
  daily: Record<string, PuzzleSession>
  dailyRecords: Record<string, DailyRecord>
  unlimitedSessions: Record<string, PuzzleSession>
  unlimited: UnlimitedStats
  currentStreak: number
  longestStreak: number
  lastDailyCompletedKey: string | null
  campaignUnlocked: number
  campaignSessions: Record<string, PuzzleSession>
  campaignRecords: Record<string, CampaignRecord>
  campaignNoHintClears: number
  achievements: string[]
  unlockedAvatars: string[]
  unlockedBorders: string[]
  unlockedTitles: string[]
  profile: PlayerProfile
  settings: import('./settings').UserSettings
  beatBestScore: number
}

function defaultUnlimited(): UnlimitedStats {
  return {
    solved: 0,
    byDifficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
    bestTimeMs: {},
    totalTimeMs: 0,
  }
}

export function defaultAppData(): AppData {
  return {
    theme: 'light',
    daily: {},
    dailyRecords: {},
    unlimitedSessions: {},
    unlimited: defaultUnlimited(),
    currentStreak: 0,
    longestStreak: 0,
    lastDailyCompletedKey: null,
    campaignUnlocked: 1,
    campaignSessions: {},
    campaignRecords: {},
    campaignNoHintClears: 0,
    achievements: [],
    unlockedAvatars: ['sun', 'moon'],
    unlockedBorders: ['plain'],
    unlockedTitles: ['wanderer'],
    profile: {
      name: 'Player',
      avatarId: 'sun',
      borderId: 'plain',
      titleId: 'wanderer',
    },
    settings: { ...DEFAULT_SETTINGS },
    beatBestScore: 0,
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(ROOT)
    if (!raw) return defaultAppData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    const base = defaultAppData()
    return {
      ...base,
      ...parsed,
      unlimited: { ...defaultUnlimited(), ...parsed.unlimited },
      daily: parsed.daily ?? {},
      dailyRecords: parsed.dailyRecords ?? {},
      unlimitedSessions: parsed.unlimitedSessions ?? {},
      campaignSessions: parsed.campaignSessions ?? {},
      campaignRecords: parsed.campaignRecords ?? {},
      achievements: parsed.achievements ?? [],
      unlockedAvatars: parsed.unlockedAvatars ?? base.unlockedAvatars,
      unlockedBorders: parsed.unlockedBorders ?? base.unlockedBorders,
      unlockedTitles: parsed.unlockedTitles ?? base.unlockedTitles,
      profile: { ...base.profile, ...parsed.profile },
      campaignUnlocked: parsed.campaignUnlocked ?? 1,
      campaignNoHintClears: parsed.campaignNoHintClears ?? 0,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      beatBestScore: parsed.beatBestScore ?? 0,
    }
  } catch {
    return defaultAppData()
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(ROOT, JSON.stringify(data))
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function cloneSessionGrid(grid: CellValue[][]): CellValue[][] {
  return grid.map((row) => [...row])
}

export function emptySession(seed: string, grid: CellValue[][]): PuzzleSession {
  return {
    seed,
    grid: cloneSessionGrid(grid),
    history: [],
    historyIndex: -1,
    elapsedMs: 0,
    started: false,
    completed: false,
    hintsUsed: 0,
    mistakes: 0,
    updatedAt: Date.now(),
  }
}

function unlockAchievement(state: AppData, id: string): string[] {
  if (state.achievements.includes(id)) return []
  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) return []
  state.achievements.push(id)
  if (def.unlockAvatar && !state.unlockedAvatars.includes(def.unlockAvatar)) {
    state.unlockedAvatars.push(def.unlockAvatar)
  }
  if (def.unlockBorder && !state.unlockedBorders.includes(def.unlockBorder)) {
    state.unlockedBorders.push(def.unlockBorder)
  }
  if (def.unlockTitle) {
    const titleId = def.unlockTitle.toLowerCase().replace(/\s+/g, '-')
    if (!state.unlockedTitles.includes(titleId)) {
      state.unlockedTitles.push(titleId)
    }
  }
  return [id]
}

export function applyDailyCompletion(
  data: AppData,
  key: string,
  timeMs: number,
  hintsUsed: number,
  mistakes: number,
  seed: string,
): AppData {
  const next = structuredClone(data) as AppData
  next.dailyRecords[key] = {
    dateKey: key,
    seed,
    completed: true,
    timeMs,
    hintsUsed,
    mistakes,
  }

  const today = dateKey()
  if (key === today) {
    const yesterday = dateKey(new Date(Date.now() - 86400000))
    if (next.lastDailyCompletedKey === yesterday) {
      next.currentStreak += 1
    } else if (next.lastDailyCompletedKey !== today) {
      next.currentStreak = 1
    }
    next.longestStreak = Math.max(next.longestStreak, next.currentStreak)
    next.lastDailyCompletedKey = today
  }

  saveAppData(next)
  return next
}

export function applyUnlimitedCompletion(
  data: AppData,
  difficulty: Difficulty,
  timeMs: number,
): AppData {
  const next = structuredClone(data) as AppData
  next.unlimited.solved += 1
  next.unlimited.byDifficulty[difficulty] += 1
  next.unlimited.totalTimeMs += timeMs
  const best = next.unlimited.bestTimeMs[difficulty]
  if (best === undefined || timeMs < best) {
    next.unlimited.bestTimeMs[difficulty] = timeMs
  }
  saveAppData(next)
  return next
}

export function applyCampaignCompletion(
  data: AppData,
  level: number,
  timeMs: number,
  hintsUsed: number,
): { state: AppData; newAchievements: string[] } {
  const next = structuredClone(data) as AppData
  const key = String(level)
  const existing = next.campaignRecords[key]
  if (!existing) {
    next.campaignRecords[key] = {
      bestTimeMs: timeMs,
      clears: 1,
      hintsUsedBest: hintsUsed,
    }
  } else {
    existing.clears += 1
    if (timeMs < existing.bestTimeMs) {
      existing.bestTimeMs = timeMs
      existing.hintsUsedBest = hintsUsed
    }
  }

  if (level >= next.campaignUnlocked && level < CAMPAIGN_LEVELS) {
    next.campaignUnlocked = level + 1
  }
  if (level === CAMPAIGN_LEVELS) {
    next.campaignUnlocked = CAMPAIGN_LEVELS
  }

  if (hintsUsed === 0) next.campaignNoHintClears += 1

  const newly: string[] = []
  const add = (id: string) => newly.push(...unlockAchievement(next, id))
  if (level >= 1) add('camp-1')
  if (next.campaignUnlocked >= 10 || level >= 10) add('camp-10')
  if (next.campaignUnlocked >= 25 || level >= 25) add('camp-25')
  if (next.campaignUnlocked >= 50 || level >= 50) add('camp-50')
  if (next.campaignUnlocked >= 75 || level >= 75) add('camp-75')
  if (level >= 100) add('camp-100')
  if (next.campaignNoHintClears >= 5) add('camp-no-hint-5')
  if (timeMs < 60_000) add('camp-speed')

  saveAppData(next)
  return { state: next, newAchievements: newly }
}

export function updateProfile(
  data: AppData,
  patch: Partial<PlayerProfile>,
): AppData {
  const next = {
    ...data,
    profile: { ...data.profile, ...patch },
  }
  saveAppData(next)
  return next
}

export function updateSettings(
  data: AppData,
  patch: Partial<UserSettings>,
): AppData {
  const next = {
    ...data,
    settings: { ...data.settings, ...patch },
  }
  saveAppData(next)
  return next
}

export function listRecentDates(count = 14): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(dateKey(d))
  }
  return out
}

export function listMonthDates(year: number, monthIndex: number): string[] {
  const out: string[] = []
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const today = dateKey()
  for (let day = 1; day <= days; day++) {
    const key = dateKey(new Date(year, monthIndex, day))
    if (key > today) continue
    out.push(key)
  }
  return out.reverse()
}

/** Count wrong cells only when the board is fully filled. */
export function countFullBoardMistakes(
  grid: CellValue[][],
  solution: (0 | 1)[][],
): number {
  const size = grid.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] === null) return 0
    }
  }
  let wrong = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] !== solution[r]![c]) wrong++
    }
  }
  return wrong
}
