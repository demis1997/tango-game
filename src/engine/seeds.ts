import { createRng } from './rng'
import type { Difficulty } from './types'

const DIFF_CODE: Record<Difficulty, string> = {
  easy: 'E',
  medium: 'M',
  hard: 'H',
  expert: 'X',
}

const CODE_DIFF: Record<string, Difficulty> = {
  E: 'easy',
  M: 'medium',
  H: 'hard',
  X: 'expert',
}

/** Encode size + difficulty + numeric seed → shareable code like 6M7K3Q2 */
export function encodeSeed(
  size: number,
  difficulty: Difficulty,
  n: number,
): string {
  const body = (n >>> 0).toString(36).toUpperCase().padStart(5, '0').slice(-5)
  return `${size}${DIFF_CODE[difficulty]}${body}`
}

export function parseSeed(code: string): {
  size: number
  difficulty: Difficulty
  n: number
} | null {
  const raw = code.trim().toUpperCase()
  const m = raw.match(/^([468]|10)([EMHX])([0-9A-Z]{3,8})$/)
  if (!m) return null
  const size = Number(m[1])
  const difficulty = CODE_DIFF[m[2]!]
  if (!difficulty) return null
  const n = parseInt(m[3]!, 36)
  if (!Number.isFinite(n)) return null
  return { size, difficulty, n }
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Local calendar date key YYYY-MM-DD */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date | null {
  const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function formatDisplayDate(key: string): string {
  const d = parseDateKey(key)
  if (!d) return key
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function dailySeedCode(key: string): string {
  const n = hashString(`tango-daily:${key}`)
  return encodeSeed(6, 'medium', n)
}

export function randomSeedCode(
  size: number,
  difficulty: Difficulty,
  entropy = Date.now(),
): string {
  const rng = createRng(hashString(`rand:${entropy}:${size}:${difficulty}`))
  return encodeSeed(size, difficulty, rng.int(36 ** 5))
}

export function difficultyLabel(d: Difficulty): string {
  switch (d) {
    case 'easy':
      return 'Easy'
    case 'medium':
      return 'Medium'
    case 'hard':
      return 'Hard'
    case 'expert':
      return 'Expert'
  }
}
