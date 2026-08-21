import { createRng, type Rng } from './rng'
import { cloneGrid } from './rules'
import { hasUniqueSolution, solveLogically } from './solver'
import type { CellValue, Constraint, Difficulty, Puzzle } from './types'

function buildValidLines(size: number): (0 | 1)[][] {
  const half = size / 2
  const lines: (0 | 1)[][] = []

  function rec(pos: number, line: (0 | 1)[], zeros: number, ones: number) {
    if (pos === size) {
      lines.push([...line])
      return
    }
    for (const v of [0, 1] as const) {
      if (v === 0 && zeros >= half) continue
      if (v === 1 && ones >= half) continue
      if (pos >= 2 && line[pos - 1] === v && line[pos - 2] === v) continue
      line[pos] = v
      rec(pos + 1, line, zeros + (v === 0 ? 1 : 0), ones + (v === 1 ? 1 : 0))
    }
  }

  rec(0, Array(size).fill(0) as (0 | 1)[], 0, 0)
  return lines
}

const lineCache = new Map<number, (0 | 1)[][]>()

function validLines(size: number): (0 | 1)[][] {
  let cached = lineCache.get(size)
  if (!cached) {
    cached = buildValidLines(size)
    lineCache.set(size, cached)
  }
  return cached
}

function colPrefixOk(
  grid: (0 | 1)[][],
  rowsFilled: number,
  size: number,
): boolean {
  const half = size / 2
  for (let c = 0; c < size; c++) {
    let zeros = 0
    let ones = 0
    for (let r = 0; r < rowsFilled; r++) {
      if (grid[r]![c] === 0) zeros++
      else ones++
    }
    if (zeros > half || ones > half) return false
    if (rowsFilled >= 3) {
      const a = grid[rowsFilled - 1]![c]
      const b = grid[rowsFilled - 2]![c]
      const d = grid[rowsFilled - 3]![c]
      if (a === b && b === d) return false
    }
  }
  return true
}

function colsFullyValid(grid: (0 | 1)[][], size: number): boolean {
  const half = size / 2
  for (let c = 0; c < size; c++) {
    let zeros = 0
    let ones = 0
    for (let r = 0; r < size; r++) {
      if (grid[r]![c] === 0) zeros++
      else ones++
      if (r >= 2) {
        const a = grid[r]![c]
        const b = grid[r - 1]![c]
        const d = grid[r - 2]![c]
        if (a === b && b === d) return false
      }
    }
    if (zeros !== half || ones !== half) return false
  }
  return true
}

export function generateSolution(size: number, rng: Rng): (0 | 1)[][] {
  const lines = validLines(size)
  const grid: (0 | 1)[][] = Array.from({ length: size }, () =>
    Array(size).fill(0),
  )

  for (let attempt = 0; attempt < 80; attempt++) {
    const order = rng.shuffle(lines.map((_, i) => i))

    function place(row: number): boolean {
      if (row === size) return colsFullyValid(grid, size)

      for (const idx of order) {
        const line = lines[idx]!
        let dup = false
        for (let r = 0; r < row; r++) {
          if (grid[r]!.every((v, c) => v === line[c])) {
            dup = true
            break
          }
        }
        if (dup) continue

        grid[row] = [...line]
        if (!colPrefixOk(grid, row + 1, size)) continue
        if (place(row + 1)) return true
      }
      return false
    }

    if (place(0)) return grid.map((r) => [...r])
  }

  return fallbackPattern(size, rng)
}

function fallbackPattern(size: number, rng: Rng): (0 | 1)[][] {
  const base: (0 | 1)[][] = []
  for (let r = 0; r < size; r++) {
    const row: (0 | 1)[] = []
    for (let c = 0; c < size; c++) {
      const block = Math.floor(c / 2) % 2
      const pair = Math.floor(r / 2) % 2
      row.push((block ^ pair) as 0 | 1)
    }
    base.push(row)
  }
  if (rng.next() > 0.5) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        base[r]![c] = (1 - base[r]![c]!) as 0 | 1
      }
    }
  }
  return base
}

export function generateConstraints(
  solution: (0 | 1)[][],
  density: number,
  rng: Rng,
): Constraint[] {
  const size = solution.length
  const candidates: Constraint[] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + 1 < size) {
        const same = solution[r]![c] === solution[r]![c + 1]
        candidates.push({
          r1: r,
          c1: c,
          r2: r,
          c2: c + 1,
          type: same ? 'eq' : 'neq',
        })
      }
      if (r + 1 < size) {
        const same = solution[r]![c] === solution[r + 1]![c]
        candidates.push({
          r1: r,
          c1: c,
          r2: r + 1,
          c2: c,
          type: same ? 'eq' : 'neq',
        })
      }
    }
  }

  const shuffled = rng.shuffle(candidates)
  const count = Math.max(3, Math.floor(shuffled.length * density))
  return shuffled.slice(0, count)
}

function paramsForDifficulty(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return { keepRatio: 0.42, constraintDensity: 0.28 }
    case 'medium':
      return { keepRatio: 0.3, constraintDensity: 0.2 }
    case 'hard':
      return { keepRatio: 0.2, constraintDensity: 0.15 }
    case 'expert':
      return { keepRatio: 0.12, constraintDensity: 0.11 }
  }
}

export function carveUniquePuzzle(
  solution: (0 | 1)[][],
  constraints: Constraint[],
  difficulty: Difficulty,
  rng: Rng,
): CellValue[][] {
  const size = solution.length
  const { keepRatio } = paramsForDifficulty(difficulty)
  const grid = cloneGrid(solution as CellValue[][])
  const cells = rng.shuffle(
    Array.from({ length: size * size }, (_, i) => ({
      r: Math.floor(i / size),
      c: i % size,
    })),
  )

  const targetKeep = Math.max(
    size,
    Math.floor(size * size * keepRatio),
  )

  for (const { r, c } of cells) {
    const filled = grid.flat().filter((x) => x !== null).length
    if (filled <= targetKeep) break

    const prev = grid[r]![c]
    grid[r]![c] = null

    if (!hasUniqueSolution(grid, constraints)) {
      grid[r]![c] = prev
      continue
    }

    if (difficulty === 'easy' || difficulty === 'medium') {
      if (solveLogically(grid, constraints) === null) {
        grid[r]![c] = prev
      }
    }
  }

  if (!hasUniqueSolution(grid, constraints)) {
    return cloneGrid(solution as CellValue[][])
  }

  return grid
}

export function generateValidatedPuzzle(
  size: number,
  difficulty: Difficulty,
  numericSeed: number,
  seedCode: string,
): Puzzle {
  // Try a few offsets if a seed somehow fails uniqueness after carve
  for (let offset = 0; offset < 8; offset++) {
    const rng = createRng((numericSeed + offset * 9973) >>> 0)
    const { constraintDensity } = paramsForDifficulty(difficulty)
    const solution = generateSolution(size, rng)
    const constraints = generateConstraints(solution, constraintDensity, rng)
    const grid = carveUniquePuzzle(solution, constraints, difficulty, rng)

    if (hasUniqueSolution(grid, constraints)) {
      return {
        size,
        grid,
        solution,
        constraints,
        difficulty,
        seed: seedCode,
      }
    }
  }

  // Absolute fallback: denser easy carve
  const rng = createRng(numericSeed >>> 0)
  const solution = generateSolution(size, rng)
  const constraints = generateConstraints(solution, 0.35, rng)
  const grid = carveUniquePuzzle(solution, constraints, 'easy', rng)
  return {
    size,
    grid,
    solution,
    constraints,
    difficulty,
    seed: seedCode,
  }
}
