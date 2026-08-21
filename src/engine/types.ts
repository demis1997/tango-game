export type CellValue = 0 | 1 | null // 0 = sun, 1 = moon

export type ConstraintType = 'eq' | 'neq'

export interface Constraint {
  r1: number
  c1: number
  r2: number
  c2: number
  type: ConstraintType
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard'

export interface Puzzle {
  size: number
  grid: CellValue[][]
  solution: (0 | 1)[][]
  constraints: Constraint[]
  difficulty: Difficulty
  level: number
}

export interface HintResult {
  row: number
  col: number
  value: 0 | 1
  reason: string
}

export interface Violation {
  row: number
  col: number
}
