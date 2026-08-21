import { canPlace, cloneGrid } from './rules'
import type { CellValue, Constraint } from './types'

/** Count solutions up to `limit` (typically 2 for uniqueness). */
export function countSolutions(
  start: CellValue[][],
  constraints: Constraint[],
  limit = 2,
): number {
  const grid = cloneGrid(start)
  const size = grid.length
  const empties: { r: number; c: number }[] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] === null) empties.push({ r, c })
    }
  }

  let found = 0

  function dfs(i: number): boolean {
    if (found >= limit) return true
    if (i === empties.length) {
      found++
      return found >= limit
    }

    const { r, c } = empties[i]!
    for (const v of [0, 1] as const) {
      if (!canPlace(grid, r, c, v, constraints)) continue
      grid[r]![c] = v
      if (dfs(i + 1)) {
        grid[r]![c] = null
        return true
      }
      grid[r]![c] = null
    }
    return false
  }

  dfs(0)
  return found
}

export function hasUniqueSolution(
  grid: CellValue[][],
  constraints: Constraint[],
): boolean {
  return countSolutions(grid, constraints, 2) === 1
}

/** Fill using only forced logical moves; returns true if fully solved. */
export function solveLogically(
  start: CellValue[][],
  constraints: Constraint[],
): CellValue[][] | null {
  const grid = cloneGrid(start)
  const size = grid.length
  const half = size / 2
  let progress = true

  while (progress) {
    progress = false

    // Constraint forcing
    for (const cons of constraints) {
      const a = grid[cons.r1]![cons.c1]
      const b = grid[cons.r2]![cons.c2]
      if (a !== null && b === null) {
        const v: 0 | 1 = cons.type === 'eq' ? a : ((1 - a) as 0 | 1)
        if (!canPlace(grid, cons.r2, cons.c2, v, constraints)) return null
        grid[cons.r2]![cons.c2] = v
        progress = true
      } else if (b !== null && a === null) {
        const v: 0 | 1 = cons.type === 'eq' ? b : ((1 - b) as 0 | 1)
        if (!canPlace(grid, cons.r1, cons.c1, v, constraints)) return null
        grid[cons.r1]![cons.c1] = v
        progress = true
      }
    }

    // Balance
    for (let r = 0; r < size; r++) {
      for (const v of [0, 1] as const) {
        let count = 0
        const empties: number[] = []
        for (let c = 0; c < size; c++) {
          if (grid[r]![c] === v) count++
          else if (grid[r]![c] === null) empties.push(c)
        }
        if (count === half && empties.length) {
          const other = (1 - v) as 0 | 1
          for (const c of empties) {
            if (!canPlace(grid, r, c, other, constraints)) return null
            grid[r]![c] = other
            progress = true
          }
        }
      }
    }
    for (let c = 0; c < size; c++) {
      for (const v of [0, 1] as const) {
        let count = 0
        const empties: number[] = []
        for (let r = 0; r < size; r++) {
          if (grid[r]![c] === v) count++
          else if (grid[r]![c] === null) empties.push(r)
        }
        if (count === half && empties.length) {
          const other = (1 - v) as 0 | 1
          for (const r of empties) {
            if (!canPlace(grid, r, c, other, constraints)) return null
            grid[r]![c] = other
            progress = true
          }
        }
      }
    }

    // Doubles XX_ / _XX
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        const a = grid[r]![c]
        const b = grid[r]![c + 1]
        if (a === null || a !== b) continue
        const opp = (1 - a) as 0 | 1
        if (c > 0 && grid[r]![c - 1] === null) {
          if (!canPlace(grid, r, c - 1, opp, constraints)) return null
          grid[r]![c - 1] = opp
          progress = true
        }
        if (c + 2 < size && grid[r]![c + 2] === null) {
          if (!canPlace(grid, r, c + 2, opp, constraints)) return null
          grid[r]![c + 2] = opp
          progress = true
        }
      }
    }
    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size - 1; r++) {
        const a = grid[r]![c]
        const b = grid[r + 1]![c]
        if (a === null || a !== b) continue
        const opp = (1 - a) as 0 | 1
        if (r > 0 && grid[r - 1]![c] === null) {
          if (!canPlace(grid, r - 1, c, opp, constraints)) return null
          grid[r - 1]![c] = opp
          progress = true
        }
        if (r + 2 < size && grid[r + 2]![c] === null) {
          if (!canPlace(grid, r + 2, c, opp, constraints)) return null
          grid[r + 2]![c] = opp
          progress = true
        }
      }
    }

    // Sandwich
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 2; c++) {
        const a = grid[r]![c]
        const mid = grid[r]![c + 1]
        const b = grid[r]![c + 2]
        if (a !== null && a === b && mid === null) {
          const v = (1 - a) as 0 | 1
          if (!canPlace(grid, r, c + 1, v, constraints)) return null
          grid[r]![c + 1] = v
          progress = true
        }
      }
    }
    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size - 2; r++) {
        const a = grid[r]![c]
        const mid = grid[r + 1]![c]
        const b = grid[r + 2]![c]
        if (a !== null && a === b && mid === null) {
          const v = (1 - a) as 0 | 1
          if (!canPlace(grid, r + 1, c, v, constraints)) return null
          grid[r + 1]![c] = v
          progress = true
        }
      }
    }

    // Only-one legal
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r]![c] !== null) continue
        const opts: (0 | 1)[] = []
        for (const v of [0, 1] as const) {
          if (canPlace(grid, r, c, v, constraints)) opts.push(v)
        }
        if (opts.length === 0) return null
        if (opts.length === 1) {
          grid[r]![c] = opts[0]!
          progress = true
        }
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] === null) return null
    }
  }
  return grid
}
