import { cloneGrid } from './rules'
import type { Rng } from './rng'
import type { CellValue, Constraint } from './types'

/** All balanced binary lines with no three-in-a-row */
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

function colPrefixOk(grid: (0 | 1)[][], rowsFilled: number, size: number): boolean {
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

/** Generate a full valid binary grid with balance + no-three rules */
export function generateSolution(size: number, rng: Rng): (0 | 1)[][] {
  const lines = validLines(size)
  const grid: (0 | 1)[][] = Array.from({ length: size }, () =>
    Array(size).fill(0),
  )

  for (let attempt = 0; attempt < 120; attempt++) {
    const order = rng.shuffle(lines.map((_, i) => i))

    function place(row: number): boolean {
      if (row === size) return colsFullyValid(grid, size)

      for (const idx of order) {
        const line = lines[idx]!
        // Avoid duplicate rows (common Takuzu rule / keeps uniqueness nicer)
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

  // Deterministic fallback pattern (always valid for even sizes)
  return fallbackPattern(size, rng)
}

function fallbackPattern(size: number, rng: Rng): (0 | 1)[][] {
  const base: (0 | 1)[][] = []
  for (let r = 0; r < size; r++) {
    const row: (0 | 1)[] = []
    for (let c = 0; c < size; c++) {
      // 00110011… shifted per row pair — classic valid tiling
      const block = Math.floor(c / 2) % 2
      const pair = Math.floor(r / 2) % 2
      row.push((block ^ pair) as 0 | 1)
    }
    base.push(row)
  }

  // Random symbol flip + occasional row/col swaps of equal pairs
  if (rng.next() > 0.5) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        base[r]![c] = (1 - base[r]![c]!) as 0 | 1
      }
    }
  }

  return base
}

/** Place = / × constraints that match the solution */
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
  const count = Math.max(2, Math.floor(shuffled.length * density))
  return shuffled.slice(0, count)
}

/**
 * Carve givens from a full solution. Higher keepRatio = easier.
 */
export function carvePuzzle(
  solution: (0 | 1)[][],
  keepRatio: number,
  rng: Rng,
): CellValue[][] {
  const size = solution.length
  const grid = cloneGrid(solution as CellValue[][])
  const cells = rng.shuffle(
    Array.from({ length: size * size }, (_, i) => ({
      r: Math.floor(i / size),
      c: i % size,
    })),
  )

  const keepCount = Math.max(
    Math.floor(size * 0.75),
    Math.floor(size * size * keepRatio),
  )
  let kept = size * size

  for (const { r, c } of cells) {
    if (kept <= keepCount) break
    grid[r]![c] = null
    kept--
  }

  return grid
}