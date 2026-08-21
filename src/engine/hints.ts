import { canPlace, cloneGrid } from './rules'
import type { CellValue, Constraint, HintResult } from './types'

const LABEL = { 0: 'Sun', 1: 'Moon' } as const

/** Find a logically forced cell using common deduction rules */
export function findHint(
  grid: CellValue[][],
  constraints: Constraint[],
  solution: (0 | 1)[][],
): HintResult | null {
  const size = grid.length
  const half = size / 2

  // 1. Constraint forcing
  for (const cons of constraints) {
    const a = grid[cons.r1]![cons.c1]
    const b = grid[cons.r2]![cons.c2]
    if (a !== null && b === null) {
      const value: 0 | 1 =
        cons.type === 'eq' ? a : ((1 - a) as 0 | 1)
      if (canPlace(grid, cons.r2, cons.c2, value, constraints)) {
        return {
          row: cons.r2,
          col: cons.c2,
          value,
          reason: `Constraint ${cons.type === 'eq' ? '=' : '×'} forces a ${LABEL[value]} here.`,
        }
      }
    }
    if (b !== null && a === null) {
      const value: 0 | 1 =
        cons.type === 'eq' ? b : ((1 - b) as 0 | 1)
      if (canPlace(grid, cons.r1, cons.c1, value, constraints)) {
        return {
          row: cons.r1,
          col: cons.c1,
          value,
          reason: `Constraint ${cons.type === 'eq' ? '=' : '×'} forces a ${LABEL[value]} here.`,
        }
      }
    }
  }

  // 2. Balance completion
  for (let r = 0; r < size; r++) {
    for (const v of [0, 1] as const) {
      let count = 0
      const empties: number[] = []
      for (let c = 0; c < size; c++) {
        if (grid[r]![c] === v) count++
        else if (grid[r]![c] === null) empties.push(c)
      }
      if (count === half && empties.length > 0) {
        const other = (1 - v) as 0 | 1
        const c = empties[0]!
        if (canPlace(grid, r, c, other, constraints)) {
          return {
            row: r,
            col: c,
            value: other,
            reason: `This row already has ${half} ${LABEL[v]}s — remaining cells must be ${LABEL[other]}s.`,
          }
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
      if (count === half && empties.length > 0) {
        const other = (1 - v) as 0 | 1
        const r = empties[0]!
        if (canPlace(grid, r, c, other, constraints)) {
          return {
            row: r,
            col: c,
            value: other,
            reason: `This column already has ${half} ${LABEL[v]}s — remaining cells must be ${LABEL[other]}s.`,
          }
        }
      }
    }
  }

  // 3. No-three: XX_ or _XX must be opposite
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      const a = grid[r]![c]
      const b = grid[r]![c + 1]
      if (a !== null && a === b) {
        if (c > 0 && grid[r]![c - 1] === null) {
          const v = (1 - a) as 0 | 1
          if (canPlace(grid, r, c - 1, v, constraints)) {
            return {
              row: r,
              col: c - 1,
              value: v,
              reason: `Two ${LABEL[a]}s in a row — this cell must be a ${LABEL[v]} to avoid three in a row.`,
            }
          }
        }
        if (c + 2 < size && grid[r]![c + 2] === null) {
          const v = (1 - a) as 0 | 1
          if (canPlace(grid, r, c + 2, v, constraints)) {
            return {
              row: r,
              col: c + 2,
              value: v,
              reason: `Two ${LABEL[a]}s in a row — this cell must be a ${LABEL[v]} to avoid three in a row.`,
            }
          }
        }
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 1; r++) {
      const a = grid[r]![c]
      const b = grid[r + 1]![c]
      if (a !== null && a === b) {
        if (r > 0 && grid[r - 1]![c] === null) {
          const v = (1 - a) as 0 | 1
          if (canPlace(grid, r - 1, c, v, constraints)) {
            return {
              row: r - 1,
              col: c,
              value: v,
              reason: `Two ${LABEL[a]}s stacked — this cell must be a ${LABEL[v]} to avoid three in a column.`,
            }
          }
        }
        if (r + 2 < size && grid[r + 2]![c] === null) {
          const v = (1 - a) as 0 | 1
          if (canPlace(grid, r + 2, c, v, constraints)) {
            return {
              row: r + 2,
              col: c,
              value: v,
              reason: `Two ${LABEL[a]}s stacked — this cell must be a ${LABEL[v]} to avoid three in a column.`,
            }
          }
        }
      }
    }
  }

  // 4. Sandwich A _ A → middle opposite
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      const a = grid[r]![c]
      const mid = grid[r]![c + 1]
      const b = grid[r]![c + 2]
      if (a !== null && b !== null && a === b && mid === null) {
        const v = (1 - a) as 0 | 1
        if (canPlace(grid, r, c + 1, v, constraints)) {
          return {
            row: r,
            col: c + 1,
            value: v,
            reason: `Sandwich pattern: two ${LABEL[a]}s with a gap — middle must be ${LABEL[v]}.`,
          }
        }
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      const a = grid[r]![c]
      const mid = grid[r + 1]![c]
      const b = grid[r + 2]![c]
      if (a !== null && b !== null && a === b && mid === null) {
        const v = (1 - a) as 0 | 1
        if (canPlace(grid, r + 1, c, v, constraints)) {
          return {
            row: r + 1,
            col: c,
            value: v,
            reason: `Sandwich pattern: two ${LABEL[a]}s with a gap — middle must be ${LABEL[v]}.`,
          }
        }
      }
    }
  }

  // 5. Only one legal value for a cell
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] !== null) continue
      const opts: (0 | 1)[] = []
      for (const v of [0, 1] as const) {
        if (canPlace(grid, r, c, v, constraints)) opts.push(v)
      }
      if (opts.length === 1) {
        return {
          row: r,
          col: c,
          value: opts[0]!,
          reason: `Only ${LABEL[opts[0]!]} fits here without breaking a rule.`,
        }
      }
    }
  }

  // Fallback: reveal a correct empty cell from solution
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] === null) {
        return {
          row: r,
          col: c,
          value: solution[r]![c]!,
          reason: `This cell is a ${LABEL[solution[r]![c]!]} — keep going!`,
        }
      }
    }
  }

  return null
}

/** Apply hint and return new grid */
export function applyHint(
  grid: CellValue[][],
  hint: HintResult,
): CellValue[][] {
  const next = cloneGrid(grid)
  next[hint.row]![hint.col] = hint.value
  return next
}
