import { useMemo, type CSSProperties } from 'react'
import type { CellValue, Constraint, Violation } from '../engine/types'
import './Board.css'

interface BoardProps {
  grid: CellValue[][]
  constraints: Constraint[]
  givens: boolean[][]
  violations: Violation[]
  hintCell: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  disabled?: boolean
}

function constraintAt(
  constraints: Constraint[],
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): Constraint | undefined {
  return constraints.find(
    (c) =>
      (c.r1 === r1 && c.c1 === c1 && c.r2 === r2 && c.c2 === c2) ||
      (c.r1 === r2 && c.c1 === c2 && c.r2 === r1 && c.c2 === c1),
  )
}

export function Board({
  grid,
  constraints,
  givens,
  violations,
  hintCell,
  onCellClick,
  disabled,
}: BoardProps) {
  const size = grid.length
  const violationSet = useMemo(
    () => new Set(violations.map((v) => `${v.row},${v.col}`)),
    [violations],
  )

  return (
    <div
      className="board"
      style={{ '--board-size': size } as CSSProperties}
      role="grid"
      aria-label={`${size} by ${size} tango board`}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isGiven = givens[r]![c]
          const isViolation = violationSet.has(`${r},${c}`)
          const isHint = hintCell?.row === r && hintCell?.col === c
          const right = c + 1 < size ? constraintAt(constraints, r, c, r, c + 1) : undefined
          const below = r + 1 < size ? constraintAt(constraints, r, c, r + 1, c) : undefined

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={[
                'cell',
                cell === 0 ? 'sun' : '',
                cell === 1 ? 'moon' : '',
                isGiven ? 'given' : '',
                isViolation ? 'violation' : '',
                isHint ? 'hint' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !disabled && !isGiven && onCellClick(r, c)}
              disabled={disabled || isGiven}
              aria-label={
                cell === 0 ? 'Sun' : cell === 1 ? 'Moon' : `Empty cell row ${r + 1} column ${c + 1}`
              }
            >
              {cell === 0 && <span className="glyph sun-glyph" />}
              {cell === 1 && <span className="glyph moon-glyph" />}
              {right && (
                <span className={`constraint horizontal ${right.type}`}>
                  {right.type === 'eq' ? '=' : '×'}
                </span>
              )}
              {below && (
                <span className={`constraint vertical ${below.type}`}>
                  {below.type === 'eq' ? '=' : '×'}
                </span>
              )}
            </button>
          )
        }),
      )}
    </div>
  )
}
