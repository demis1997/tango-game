import { useMemo, type CSSProperties } from 'react'
import { MoonIcon, SunIcon } from './icons'
import type { CellValue, Constraint, HintResult, Violation } from '../engine/types'
import './GameBoard.css'

interface GameBoardProps {
  grid: CellValue[][]
  constraints: Constraint[]
  givens: boolean[][]
  violations: Violation[]
  hint?: HintResult | null
  disabled?: boolean
  onCycle: (row: number, col: number, reverse: boolean) => void
}

function constraintAt(
  constraints: Constraint[],
  r1: number,
  c1: number,
  r2: number,
  c2: number,
) {
  return constraints.find(
    (c) =>
      (c.r1 === r1 && c.c1 === c1 && c.r2 === r2 && c.c2 === c2) ||
      (c.r1 === r2 && c.c1 === c2 && c.r2 === r1 && c.c2 === c1),
  )
}

export function GameBoard({
  grid,
  constraints,
  givens,
  violations,
  hint,
  disabled,
  onCycle,
}: GameBoardProps) {
  const size = grid.length
  const violationSet = useMemo(
    () => new Set(violations.map((v) => `${v.row},${v.col}`)),
    [violations],
  )

  const longPressRef = useMemo(
    () => ({ timer: 0 as number, fired: false }),
    [],
  )

  return (
    <div
      className="game-board"
      style={{ '--n': size } as CSSProperties}
      role="grid"
      aria-label={`${size} by ${size} tango board`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const given = givens[r]![c]
          const bad = violationSet.has(`${r},${c}`)
          const isHint = hint?.row === r && hint?.col === c
          const rowHL = hint?.highlight?.type === 'row' && hint.highlight.row === r
          const colHL = hint?.highlight?.type === 'col' && hint.highlight.col === c
          const right =
            c + 1 < size ? constraintAt(constraints, r, c, r, c + 1) : undefined
          const below =
            r + 1 < size ? constraintAt(constraints, r, c, r + 1, c) : undefined

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={[
                'game-cell',
                cell === 0 ? 'is-sun' : '',
                cell === 1 ? 'is-moon' : '',
                given ? 'is-given' : '',
                bad ? 'is-invalid' : '',
                isHint ? 'is-hint' : '',
                rowHL || colHL ? 'is-line-hint' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled || given}
              aria-label={
                cell === 0
                  ? 'Sun'
                  : cell === 1
                    ? 'Moon'
                    : `Empty cell row ${r + 1} column ${c + 1}`
              }
              onClick={(e) => {
                if (longPressRef.fired) {
                  longPressRef.fired = false
                  return
                }
                if (e.shiftKey) onCycle(r, c, true)
                else onCycle(r, c, false)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                if (!disabled && !given) onCycle(r, c, true)
              }}
              onPointerDown={() => {
                longPressRef.fired = false
                longPressRef.timer = window.setTimeout(() => {
                  longPressRef.fired = true
                  if (!disabled && !given) onCycle(r, c, true)
                }, 420)
              }}
              onPointerUp={() => window.clearTimeout(longPressRef.timer)}
              onPointerLeave={() => window.clearTimeout(longPressRef.timer)}
              onPointerCancel={() => window.clearTimeout(longPressRef.timer)}
            >
              {cell === 0 && <SunIcon className="cell-icon sun" />}
              {cell === 1 && <MoonIcon className="cell-icon moon" />}
              {right && (
                <span className={`mark mark-h mark-${right.type}`} aria-hidden>
                  {right.type === 'eq' ? '=' : '×'}
                </span>
              )}
              {below && (
                <span className={`mark mark-v mark-${below.type}`} aria-hidden>
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
