import { carvePuzzle, generateConstraints, generateSolution } from './generator'
import { createRng } from './rng'
import type { Difficulty, Puzzle } from './types'

export const TOTAL_LEVELS = 1000

export interface LevelMeta {
  level: number
  size: number
  difficulty: Difficulty
  label: string
}

/** Map level 1–1000 → size + difficulty ramp */
export function getLevelMeta(level: number): LevelMeta {
  const n = Math.max(1, Math.min(TOTAL_LEVELS, level))

  let size: number
  let difficulty: Difficulty
  let label: string

  if (n <= 80) {
    size = 4
    difficulty = n <= 40 ? 'easy' : 'medium'
    label = n <= 40 ? 'Warm-up' : 'Getting cozy'
  } else if (n <= 280) {
    size = 6
    if (n <= 140) difficulty = 'easy'
    else if (n <= 210) difficulty = 'medium'
    else difficulty = 'hard'
    label =
      difficulty === 'easy'
        ? 'Classic easy'
        : difficulty === 'medium'
          ? 'Classic medium'
          : 'Classic hard'
  } else if (n <= 520) {
    size = 6
    difficulty = n <= 400 ? 'hard' : 'very-hard'
    label = difficulty === 'hard' ? 'Deep classic' : 'Brutal classic'
  } else if (n <= 780) {
    size = 8
    if (n <= 600) difficulty = 'medium'
    else if (n <= 700) difficulty = 'hard'
    else difficulty = 'very-hard'
    label =
      difficulty === 'medium'
        ? 'Challenge medium'
        : difficulty === 'hard'
          ? 'Challenge hard'
          : 'Challenge extreme'
  } else {
    size = n <= 920 ? 8 : 10
    difficulty = 'very-hard'
    label = size === 8 ? 'Masterboard' : 'Legend board'
  }

  return { level: n, size, difficulty, label }
}

function paramsForDifficulty(difficulty: Difficulty, size: number) {
  switch (difficulty) {
    case 'easy':
      return { keepRatio: 0.42, constraintDensity: 0.28 }
    case 'medium':
      return { keepRatio: 0.32, constraintDensity: 0.22 }
    case 'hard':
      return { keepRatio: 0.22, constraintDensity: 0.18 }
    case 'very-hard':
      return {
        keepRatio: size >= 8 ? 0.14 : 0.16,
        constraintDensity: 0.14,
      }
  }
}

export function generateLevel(level: number): Puzzle {
  const meta = getLevelMeta(level)
  const rng = createRng(level * 2654435761 + meta.size * 97)
  const { keepRatio, constraintDensity } = paramsForDifficulty(
    meta.difficulty,
    meta.size,
  )

  const solution = generateSolution(meta.size, rng)
  const constraints = generateConstraints(solution, constraintDensity, rng)
  const grid = carvePuzzle(solution, keepRatio, rng)

  return {
    size: meta.size,
    grid,
    solution,
    constraints,
    difficulty: meta.difficulty,
    level,
  }
}

/** Random puzzle at a chosen difficulty band (or any) */
export function generateRandomPuzzle(
  seed: number,
  options?: { size?: number; difficulty?: Difficulty },
): Puzzle {
  const sizes = options?.size
    ? [options.size]
    : ([4, 6, 8, 10] as const)
  const diffs: Difficulty[] = options?.difficulty
    ? [options.difficulty]
    : ['easy', 'medium', 'hard', 'very-hard']

  const rng = createRng(seed)
  const size = rng.pick([...sizes])
  const difficulty = rng.pick(diffs)
  const { keepRatio, constraintDensity } = paramsForDifficulty(difficulty, size)

  const solution = generateSolution(size, rng)
  const constraints = generateConstraints(solution, constraintDensity, rng)
  const grid = carvePuzzle(solution, keepRatio, rng)

  return {
    size,
    grid,
    solution,
    constraints,
    difficulty,
    level: 0, // random mode
  }
}

export function difficultyColor(d: Difficulty): string {
  switch (d) {
    case 'easy':
      return '#3d9a6a'
    case 'medium':
      return '#c4a035'
    case 'hard':
      return '#d4783a'
    case 'very-hard':
      return '#c44a5a'
  }
}

export function difficultyLabel(d: Difficulty): string {
  switch (d) {
    case 'easy':
      return 'Easy'
    case 'medium':
      return 'Medium'
    case 'hard':
      return 'Hard'
    case 'very-hard':
      return 'Very Hard'
  }
}
