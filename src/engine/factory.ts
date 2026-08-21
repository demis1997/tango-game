import { generateValidatedPuzzle } from './puzzle'
import {
  dailySeedCode,
  encodeSeed,
  parseSeed,
  randomSeedCode,
} from './seeds'
import type { Difficulty, Puzzle } from './types'

const cache = new Map<string, Puzzle>()

export function getPuzzleBySeed(seedCode: string): Puzzle | null {
  const parsed = parseSeed(seedCode)
  if (!parsed) return null

  const key = seedCode.toUpperCase()
  const hit = cache.get(key)
  if (hit) return hit

  const puzzle = generateValidatedPuzzle(
    parsed.size,
    parsed.difficulty,
    parsed.n,
    key,
  )
  cache.set(key, puzzle)
  return puzzle
}

export function getDailyPuzzle(dateKey: string): Puzzle {
  const code = dailySeedCode(dateKey)
  return getPuzzleBySeed(code)!
}

export function getNewUnlimitedPuzzle(
  size: number,
  difficulty: Difficulty,
  entropy?: number,
): Puzzle {
  const code = randomSeedCode(size, difficulty, entropy ?? Date.now())
  return getPuzzleBySeed(code)!
}

export function ensureSeed(
  size: number,
  difficulty: Difficulty,
  n: number,
): string {
  return encodeSeed(size, difficulty, n)
}
