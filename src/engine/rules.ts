import type { CellValue, Constraint, Violation } from './types'

export function emptyGrid(size: number): CellValue[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null))
}

export function cloneGrid(grid: CellValue[][]): CellValue[][] {
  return grid.map((row) => [...row])
}

export function countInLine(line: CellValue[], value: 0 | 1): number {
  return line.filter((c) => c === value).length
}

function hasThreeInARow(line: CellValue[]): boolean {
  for (let i = 0; i < line.length - 2; i++) {
    const a = line[i]
    const b = line[i + 1]
    const c = line[i + 2]
    if (a !== null && a === b && b === c) return true
  }
  return false
}

export function getRow(grid: CellValue[][], r: number): CellValue[] {
  return grid[r]!
}

export function getCol(grid: CellValue[][], c: number): CellValue[] {
  return grid.map((row) => row[c]!)
}

export function isLineBalanced(line: CellValue[]): boolean {
  const half = line.length / 2
  if (line.some((c) => c === null)) return false
  return countInLine(line, 0) === half && countInLine(line, 1) === half
}

export function lineWouldExceedBalance(line: CellValue[], value: 0 | 1): boolean {
  const half = line.length / 2
  return countInLine(line, value) > half
}

export function canPlace(
  grid: CellValue[][],
  r: number,
  c: number,
  value: 0 | 1,
  constraints: Constraint[],
): boolean {
  if (grid[r]![c] !== null) return false

  // Balance check
  const row = [...getRow(grid, r)]
  row[c] = value
  if (lineWouldExceedBalance(row, value)) return false
  if (hasThreeInARow(row)) return false

  const col = [...getCol(grid, c)]
  col[r] = value
  if (lineWouldExceedBalance(col, value)) return false
  if (hasThreeInARow(col)) return false

  // Constraint checks
  for (const cons of constraints) {
    const isA = cons.r1 === r && cons.c1 === c
    const isB = cons.r2 === r && cons.c2 === c
    if (!isA && !isB) continue

    const or = isA ? cons.r2 : cons.r1
    const oc = isA ? cons.c2 : cons.c1
    const other = grid[or]![oc]
    if (other === null) continue

    if (cons.type === 'eq' && other !== value) return false
    if (cons.type === 'neq' && other === value) return false
  }

  return true
}

export function getViolations(
  grid: CellValue[][],
  constraints: Constraint[],
): Violation[] {
  const size = grid.length
  const bad = new Set<string>()
  const mark = (r: number, c: number) => bad.add(`${r},${c}`)

  // Three in a row
  for (let r = 0; r < size; r++) {
    const row = getRow(grid, r)
    for (let c = 0; c < size - 2; c++) {
      const a = row[c]
      const b = row[c + 1]
      const d = row[c + 2]
      if (a !== null && a === b && b === d) {
        mark(r, c)
        mark(r, c + 1)
        mark(r, c + 2)
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
        mark(r, c)
        mark(r + 1, c)
        mark(r + 2, c)
      }
    }
  }

  // Balance overflow
  const half = size / 2
  for (let r = 0; r < size; r++) {
    const row = getRow(grid, r)
    for (const v of [0, 1] as const) {
      if (countInLine(row, v) > half) {
        for (let c = 0; c < size; c++) {
          if (row[c] === v) mark(r, c)
        }
      }
    }
  }
  for (let c = 0; c < size; c++) {
    const col = getCol(grid, c)
    for (const v of [0, 1] as const) {
      if (countInLine(col, v) > half) {
        for (let r = 0; r < size; r++) {
          if (col[r] === v) mark(r, c)
        }
      }
    }
  }

  // Constraints
  for (const cons of constraints) {
    const a = grid[cons.r1]![cons.c1]
    const b = grid[cons.r2]![cons.c2]
    if (a === null || b === null) continue
    const ok = cons.type === 'eq' ? a === b : a !== b
    if (!ok) {
      mark(cons.r1, cons.c1)
      mark(cons.r2, cons.c2)
    }
  }

  return [...bad].map((k) => {
    const [r, c] = k.split(',').map(Number)
    return { row: r!, col: c! }
  })
}

export function isComplete(
  grid: CellValue[][],
  constraints: Constraint[],
): boolean {
  const size = grid.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r]![c] === null) return false
    }
  }
  if (getViolations(grid, constraints).length > 0) return false
  for (let i = 0; i < size; i++) {
    if (!isLineBalanced(getRow(grid, i))) return false
    if (!isLineBalanced(getCol(grid, i))) return false
  }
  return true
}

export function matchesSolution(
  grid: CellValue[][],
  solution: (0 | 1)[][],
): boolean {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (grid[r]![c] !== solution[r]![c]) return false
    }
  }
  return true
}
