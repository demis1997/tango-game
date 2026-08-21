import {
  countInLine,
  getCol,
  getRow,
  getViolations,
  isComplete,
  isLineBalanced,
} from './rules'
import { countSolutions } from './solver'
import type { CellValue, Constraint, Violation } from './types'

export type ViolationKind =
  | 'triple'
  | 'balance'
  | 'constraint'
  | 'duplicate-row'
  | 'duplicate-col'

export interface ExplainedViolation {
  cells: Violation[]
  kind: ViolationKind
  message: string
}

function lineKey(line: CellValue[]): string {
  return line.join('')
}

/** Mark duplicate fully-filled identical rows/cols. */
export function getDuplicateLineViolations(grid: CellValue[][]): Violation[] {
  const size = grid.length
  const bad = new Set<string>()
  const mark = (r: number, c: number) => bad.add(`${r},${c}`)

  const rowKeys = new Map<string, number[]>()
  for (let r = 0; r < size; r++) {
    const row = getRow(grid, r)
    if (row.some((c) => c === null)) continue
    const key = lineKey(row)
    const list = rowKeys.get(key) ?? []
    list.push(r)
    rowKeys.set(key, list)
  }
  for (const rows of rowKeys.values()) {
    if (rows.length < 2) continue
    for (const r of rows) {
      for (let c = 0; c < size; c++) mark(r, c)
    }
  }

  const colKeys = new Map<string, number[]>()
  for (let c = 0; c < size; c++) {
    const col = getCol(grid, c)
    if (col.some((v) => v === null)) continue
    const key = lineKey(col)
    const list = colKeys.get(key) ?? []
    list.push(c)
    colKeys.set(key, list)
  }
  for (const cols of colKeys.values()) {
    if (cols.length < 2) continue
    for (const c of cols) {
      for (let r = 0; r < size; r++) mark(r, c)
    }
  }

  return [...bad].map((k) => {
    const [r, c] = k.split(',').map(Number)
    return { row: r!, col: c! }
  })
}

export function getAllViolations(
  grid: CellValue[][],
  constraints: Constraint[],
): Violation[] {
  const base = getViolations(grid, constraints)
  const dups = getDuplicateLineViolations(grid)
  const set = new Set(base.map((v) => `${v.row},${v.col}`))
  for (const v of dups) set.add(`${v.row},${v.col}`)
  return [...set].map((k) => {
    const [r, c] = k.split(',').map(Number)
    return { row: r!, col: c! }
  })
}

export function explainViolations(
  grid: CellValue[][],
  constraints: Constraint[],
): ExplainedViolation[] {
  const size = grid.length
  const half = size / 2
  const out: ExplainedViolation[] = []

  for (let r = 0; r < size; r++) {
    const row = getRow(grid, r)
    for (let c = 0; c < size - 2; c++) {
      const a = row[c]
      const b = row[c + 1]
      const d = row[c + 2]
      if (a !== null && a === b && b === d) {
        out.push({
          kind: 'triple',
          cells: [
            { row: r, col: c },
            { row: r, col: c + 1 },
            { row: r, col: c + 2 },
          ],
          message: `Row ${r + 1} has three identical symbols in a row.`,
        })
      }
    }
  }

  for (let c = 0; c < size; c++) {
    const col = getCol(grid, c)
    for (let r = 0; r < size - 2; r++) {
      const a = col[r]
      const b = col[r + 1]
      const d = col[r + 2]
      if (a !== null && a === b && b === d) {
        out.push({
          kind: 'triple',
          cells: [
            { row: r, col: c },
            { row: r + 1, col: c },
            { row: r + 2, col: c },
          ],
          message: `Column ${c + 1} has three identical symbols in a column.`,
        })
      }
    }
  }

  for (let r = 0; r < size; r++) {
    const row = getRow(grid, r)
    for (const v of [0, 1] as const) {
      if (countInLine(row, v) > half) {
        const cells: Violation[] = []
        for (let c = 0; c < size; c++) {
          if (row[c] === v) cells.push({ row: r, col: c })
        }
        out.push({
          kind: 'balance',
          cells,
          message: `Row ${r + 1} has too many of one symbol (max ${half}).`,
        })
      }
    }
  }

  for (const cons of constraints) {
    const a = grid[cons.r1]![cons.c1]
    const b = grid[cons.r2]![cons.c2]
    if (a === null || b === null) continue
    const ok = cons.type === 'eq' ? a === b : a !== b
    if (!ok) {
      out.push({
        kind: 'constraint',
        cells: [
          { row: cons.r1, col: cons.c1 },
          { row: cons.r2, col: cons.c2 },
        ],
        message:
          cons.type === 'eq'
            ? 'These cells are linked by = and must match.'
            : 'These cells are linked by × and must differ.',
      })
    }
  }

  const dups = getDuplicateLineViolations(grid)
  if (dups.length) {
    out.push({
      kind: 'duplicate-row',
      cells: dups,
      message: 'Two completed rows or columns are identical — each must be unique.',
    })
  }

  return out
}

export function isBoardComplete(
  grid: CellValue[][],
  constraints: Constraint[],
): boolean {
  if (!isComplete(grid, constraints)) return false
  return getDuplicateLineViolations(grid).length === 0
}

export function hasUniqueSolution(
  grid: CellValue[][],
  constraints: Constraint[],
): boolean {
  return countSolutions(grid, constraints, 2) === 1
}

export function validatePuzzleQuality(
  grid: CellValue[][],
  constraints: Constraint[],
): { ok: boolean; reason?: string } {
  if (countSolutions(grid, constraints, 2) !== 1) {
    return { ok: false, reason: 'not-unique' }
  }
  return { ok: true }
}

export {
  isLineBalanced,
  getViolations,
  isComplete,
}
