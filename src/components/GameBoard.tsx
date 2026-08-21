import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { MoonIcon, SunIcon } from './icons'
import type { CellValue, Constraint, HintResult, Violation } from '../engine/types'
import type { SymbolStyle } from '../store/settings'
import './GameBoard.css'

interface GameBoardProps {
  grid: CellValue[][]
  constraints: Constraint[]
  givens: boolean[][]
  violations: Violation[]
  hint?: HintResult | null
  disabled?: boolean
  symbolStyle?: SymbolStyle
  focusCell?: { row: number; col: number } | null
  onFocusCell?: (row: number, col: number) => void
  onCycle: (row: number, col: number, reverse: boolean) => void
  onSetValue?: (row: number, col: number, value: CellValue) => void
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

function Symbol({
  value,
  style,
}: {
  value: 0 | 1
  style: SymbolStyle
}) {
  if (style === 'geometric') {
    return (
      <span
        className={`geo ${value === 0 ? 'geo-a' : 'geo-b'}`}
        aria-hidden
      />
    )
  }
  return value === 0 ? (
    <SunIcon className="cell-icon sun" />
  ) : (
    <MoonIcon className="cell-icon moon" />
  )
}

export function GameBoard({
  grid,
  constraints,
  givens,
  violations,
  hint,
  disabled,
  symbolStyle = 'celestial',
  focusCell,
  onFocusCell,
  onCycle,
  onSetValue,
}: GameBoardProps) {
  const size = grid.length
  const violationSet = useMemo(
    () => new Set(violations.map((v) => `${v.row},${v.col}`)),
    [violations],
  )
  const longPressRef = useRef({ timer: 0, fired: false })
  const [localFocus, setLocalFocus] = useState({ row: 0, col: 0 })
  const focus = focusCell ?? localFocus
  const boardRef = useRef<HTMLDivElement>(null)

  const setFocus = (row: number, col: number) => {
    const next = {
      row: Math.max(0, Math.min(size - 1, row)),
      col: Math.max(0, Math.min(size - 1, col)),
    }
    setLocalFocus(next)
    onFocusCell?.(next.row, next.col)
  }

  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return
      const { row, col } = focus
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocus(row - 1, col)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocus(row + 1, col)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setFocus(row, col - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setFocus(row, col + 1)
      } else if (e.key.toLowerCase() === 's' && !givens[row]![col]) {
        e.preventDefault()
        onSetValue?.(row, col, 0)
      } else if (e.key.toLowerCase() === 'm' && !givens[row]![col]) {
        e.preventDefault()
        onSetValue?.(row, col, 1)
      } else if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        !givens[row]![col]
      ) {
        e.preventDefault()
        onSetValue?.(row, col, null)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!givens[row]![col]) onCycle(row, col, e.shiftKey)
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  })

  return (
    <div
      ref={boardRef}
      className={`game-board style-${symbolStyle}`}
      style={{ '--n': size } as CSSProperties}
      role="grid"
      aria-label={`${size} by ${size} tango board`}
      tabIndex={0}
      onContextMenu={(e) => e.preventDefault()}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const given = givens[r]![c]
          const bad = violationSet.has(`${r},${c}`)
          const isHint = hint?.row === r && hint?.col === c
          const rowHL =
            hint?.highlight?.type === 'row' && hint.highlight.row === r
          const colHL =
            hint?.highlight?.type === 'col' && hint.highlight.col === c
          const focused = focus.row === r && focus.col === c
          const right =
            c + 1 < size ? constraintAt(constraints, r, c, r, c + 1) : undefined
          const below =
            r + 1 < size ? constraintAt(constraints, r, c, r + 1, c) : undefined

          const labelBase = `Row ${r + 1} column ${c + 1}`
          const valueLabel =
            cell === 0
              ? symbolStyle === 'geometric'
                ? 'circle'
                : 'sun'
              : cell === 1
                ? symbolStyle === 'geometric'
                  ? 'square'
                  : 'moon'
                : 'empty'

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
                focused ? 'is-focused' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled || given}
              aria-label={`${labelBase}, ${valueLabel}${given ? ', fixed' : ''}`}
              tabIndex={-1}
              onFocus={() => setFocus(r, c)}
              onClick={(e) => {
                setFocus(r, c)
                if (longPressRef.current.fired) {
                  longPressRef.current.fired = false
                  return
                }
                if (e.shiftKey) onCycle(r, c, true)
                else onCycle(r, c, false)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                setFocus(r, c)
                if (!disabled && !given) onCycle(r, c, true)
              }}
              onPointerDown={() => {
                longPressRef.current.fired = false
                longPressRef.current.timer = window.setTimeout(() => {
                  longPressRef.current.fired = true
                  if (!disabled && !given) {
                    if (navigator.vibrate) navigator.vibrate(12)
                    onCycle(r, c, true)
                  }
                }, 420)
              }}
              onPointerUp={() =>
                window.clearTimeout(longPressRef.current.timer)
              }
              onPointerLeave={() =>
                window.clearTimeout(longPressRef.current.timer)
              }
              onPointerCancel={() =>
                window.clearTimeout(longPressRef.current.timer)
              }
            >
              {cell !== null && <Symbol value={cell} style={symbolStyle} />}
              {right && (
                <span
                  className={`mark mark-h mark-${right.type}`}
                  aria-label={
                    right.type === 'eq' ? 'must be same' : 'must be different'
                  }
                >
                  {right.type === 'eq' ? '=' : '×'}
                </span>
              )}
              {below && (
                <span
                  className={`mark mark-v mark-${below.type}`}
                  aria-label={
                    below.type === 'eq' ? 'must be same' : 'must be different'
                  }
                >
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
