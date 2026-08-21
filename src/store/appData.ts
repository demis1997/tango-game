import type { CellValue, Difficulty } from '../engine/types'
import { dateKey } from '../engine/seeds'

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

export interface AppData {
  theme: ThemeMode
  daily: Record<string, PuzzleSession>
  dailyRecords: Record<string, DailyRecord>
  unlimitedSessions: Record<string, PuzzleSession>
  unlimited: UnlimitedStats
  currentStreak: number
  longestStreak: number
  lastDailyCompletedKey: string | null
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
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(ROOT)
    if (!raw) return defaultAppData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      ...defaultAppData(),
      ...parsed,
      unlimited: { ...defaultUnlimited(), ...parsed.unlimited },
      daily: parsed.daily ?? {},
      dailyRecords: parsed.dailyRecords ?? {},
      unlimitedSessions: parsed.unlimitedSessions ?? {},
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

/** Update streak when a daily is completed (archive does not call this). */
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
