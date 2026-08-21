import { canPlace, cloneGrid } from './rules'
import type { CellValue, Constraint, HintResult } from './types'

const LABEL = { 0: 'Sun', 1: 'Moon' } as const

function whyOtherFails(
  grid: CellValue[][],
  r: number,
  c: number,
  bad: 0 | 1,
  constraints: Constraint[],
): string {
  const size = grid.length
  const half = size / 2
  const trial = cloneGrid(grid)
  trial[r]![c] = bad

  // Constraint clash
  for (const cons of constraints) {
    const isA = cons.r1 === r && cons.c1 === c
    const isB = cons.r2 === r && cons.c2 === c
    if (!isA && !isB) continue
    const or = isA ? cons.r2 : cons.r1
    const oc = isA ? cons.c2 : cons.c1
    const other = trial[or]![oc]
    if (other === null) continue
    if (cons.type === 'eq' && other !== bad) {
      return `a ${LABEL[bad]} would break the = link with its neighbor`
    }
    if (cons.type === 'neq' && other === bad) {
      return `a ${LABEL[bad]} would break the × link with its neighbor`
    }
  }

  // Triple in row
  const row = trial[r]!
  for (let i = 0; i < size - 2; i++) {
    if (row[i] !== null && row[i] === row[i + 1] && row[i + 1] === row[i + 2]) {
      return `a ${LABEL[bad]} would make three ${LABEL[bad]}s in a row`
    }
  }
  // Triple in col
  for (let i = 0; i < size - 2; i++) {
    const a = trial[i]![c]
    const b = trial[i + 1]![c]
    const d = trial[i + 2]![c]
    if (a !== null && a === b && b === d) {
      return `a ${LABEL[bad]} would make three ${LABEL[bad]}s in a column`
    }
  }

  // Balance
  let rowCount = 0
  for (let i = 0; i < size; i++) if (row[i] === bad) rowCount++
  if (rowCount > half) {
    return `row ${r + 1} would then have too many ${LABEL[bad]}s`
  }
  let colCount = 0
  for (let i = 0; i < size; i++) if (trial[i]![c] === bad) colCount++
  if (colCount > half) {
    return `column ${c + 1} would then have too many ${LABEL[bad]}s`
  }

  return `a ${LABEL[bad]} is illegal here`
}

/** Find a logically forced cell — always explains why that symbol is required. */
export function findHint(
  grid: CellValue[][],
  constraints: Constraint[],
  solution: (0 | 1)[][],
): HintResult | null {
  const size = grid.length
  const half = size / 2

  for (const cons of constraints) {
    const a = grid[cons.r1]![cons.c1]
    const b = grid[cons.r2]![cons.c2]
    if (a !== null && b === null) {
      const value: 0 | 1 = cons.type === 'eq' ? a : ((1 - a) as 0 | 1)
      if (canPlace(grid, cons.r2, cons.c2, value, constraints)) {
        return {
          row: cons.r2,
          col: cons.c2,
          value,
          reason:
            cons.type === 'eq'
              ? `Because of the = between these cells, this one must match its neighbor — so it is a ${LABEL[value]}.`
              : `Because of the × between these cells, this one must differ from its neighbor — so it is a ${LABEL[value]}.`,
          highlight: { type: 'constraint', constraint: cons },
        }
      }
    }
    if (b !== null && a === null) {
      const value: 0 | 1 = cons.type === 'eq' ? b : ((1 - b) as 0 | 1)
      if (canPlace(grid, cons.r1, cons.c1, value, constraints)) {
        return {
          row: cons.r1,
          col: cons.c1,
          value,
          reason:
            cons.type === 'eq'
              ? `Because of the = between these cells, this one must match its neighbor — so it is a ${LABEL[value]}.`
              : `Because of the × between these cells, this one must differ from its neighbor — so it is a ${LABEL[value]}.`,
          highlight: { type: 'constraint', constraint: cons },
        }
      }
    }
  }

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
            reason: `Row ${r + 1} already has all ${half} of its ${LABEL[v]}s, so this cell must be a ${LABEL[other]}.`,
            highlight: { type: 'row', row: r },
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
            reason: `Column ${c + 1} already has all ${half} of its ${LABEL[v]}s, so this cell must be a ${LABEL[other]}.`,
            highlight: { type: 'col', col: c },
          }
        }
      }
    }
  }

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
              reason: `Two ${LABEL[a]}s sit side by side — this cell must be a ${LABEL[v]} or you’d get three in a row.`,
              highlight: { type: 'row', row: r },
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
              reason: `Two ${LABEL[a]}s sit side by side — this cell must be a ${LABEL[v]} or you’d get three in a row.`,
              highlight: { type: 'row', row: r },
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
              reason: `Two ${LABEL[a]}s are stacked — this cell must be a ${LABEL[v]} or you’d get three in a column.`,
              highlight: { type: 'col', col: c },
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
              reason: `Two ${LABEL[a]}s are stacked — this cell must be a ${LABEL[v]} or you’d get three in a column.`,
              highlight: { type: 'col', col: c },
            }
          }
        }
      }
    }
  }

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
            reason: `A ${LABEL[a]} with a gap then another ${LABEL[a]} — the middle must be a ${LABEL[v]} to avoid three in a row.`,
            highlight: { type: 'row', row: r },
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
            reason: `A ${LABEL[a]} with a gap then another ${LABEL[a]} — the middle must be a ${LABEL[v]} to avoid three in a column.`,
            highlight: { type: 'col', col: c },
          }
        }
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] !== null) continue
      const opts: (0 | 1)[] = []
      for (const v of [0, 1] as const) {
        if (canPlace(grid, r, c, v, constraints)) opts.push(v)
      }
      if (opts.length === 1) {
        const value = opts[0]!
        const bad = (1 - value) as 0 | 1
        const why = whyOtherFails(grid, r, c, bad, constraints)
        return {
          row: r,
          col: c,
          value,
          reason: `This cell must be a ${LABEL[value]} — ${why}.`,
          highlight: { type: 'cell', row: r, col: c },
        }
      }
    }
  }

  // Last resort: explain via contradiction against the unique solution value
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] !== null) continue
      const value = solution[r]![c]!
      const bad = (1 - value) as 0 | 1
      const why = whyOtherFails(grid, r, c, bad, constraints)
      return {
        row: r,
        col: c,
        value,
        reason: `This cell must be a ${LABEL[value]} — ${why}.`,
        highlight: { type: 'cell', row: r, col: c },
      }
    }
  }

  return null
}

export function applyHint(
  grid: CellValue[][],
  hint: HintResult,
): CellValue[][] {
  const next = cloneGrid(grid)
  next[hint.row]![hint.col] = hint.value
  return next
}
