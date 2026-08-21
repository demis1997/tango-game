import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Board } from './Board'
import { findHint } from '../engine/hints'
import {
  cloneGrid,
  getViolations,
  isComplete,
  matchesSolution,
} from '../engine/rules'
import {
  difficultyColor,
  difficultyLabel,
  getLevelMeta,
} from '../engine/levels'
import type { CellValue, Puzzle } from '../engine/types'
import { formatTime } from '../store/progress'
import './GameScreen.css'

export interface ClearPayload {
  timeMs: number
  hintsUsed: number
}

interface GameScreenProps {
  puzzle: Puzzle
  bestTimeMs?: number
  modeLabel: string
  onClear: (payload: ClearPayload) => void
  onNext?: () => void
  nextLabel?: string
}

export function GameScreen({
  puzzle,
  bestTimeMs,
  modeLabel,
  onClear,
  onNext,
  nextLabel = 'Next level',
}: GameScreenProps) {
  const [grid, setGrid] = useState(() => cloneGrid(puzzle.grid))
  const [history, setHistory] = useState<CellValue[][][]>([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(
    null,
  )
  const [hintReason, setHintReason] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const [cleared, setCleared] = useState(false)
  const [clearTime, setClearTime] = useState(0)
  const startRef = useRef(Date.now())
  const reportedRef = useRef(false)

  const givens = useMemo(
    () => puzzle.grid.map((row) => row.map((c) => c !== null)),
    [puzzle],
  )

  const resetBoard = useCallback(() => {
    setGrid(cloneGrid(puzzle.grid))
    setHistory([])
    setHintsUsed(0)
    setHintCell(null)
    setHintReason(null)
    setElapsed(0)
    setRunning(true)
    setCleared(false)
    setClearTime(0)
    startRef.current = Date.now()
    reportedRef.current = false
  }, [puzzle])

  useEffect(() => {
    resetBoard()
  }, [puzzle, resetBoard])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 50)
    return () => clearInterval(id)
  }, [running])

  const violations = useMemo(
    () => getViolations(grid, puzzle.constraints),
    [grid, puzzle.constraints],
  )

  useEffect(() => {
    if (cleared || reportedRef.current) return
    if (!isComplete(grid, puzzle.constraints)) return
    if (!matchesSolution(grid, puzzle.solution)) return

    const timeMs = Date.now() - startRef.current
    setRunning(false)
    setCleared(true)
    setClearTime(timeMs)
    reportedRef.current = true
    onClear({ timeMs, hintsUsed })
  }, [grid, puzzle, cleared, hintsUsed, onClear])

  const cycleCell = (r: number, c: number) => {
    if (cleared || givens[r]![c]) return
    setHistory((h) => [...h, cloneGrid(grid)])
    setHintCell(null)
    setGrid((prev) => {
      const next = cloneGrid(prev)
      const cur = next[r]![c]
      next[r]![c] = cur === null ? 0 : cur === 0 ? 1 : null
      return next
    })
  }

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]!
      setGrid(prev)
      return h.slice(0, -1)
    })
    setHintCell(null)
  }

  const useHint = () => {
    if (cleared) return
    const hint = findHint(grid, puzzle.constraints, puzzle.solution)
    if (!hint) return
    setHistory((h) => [...h, cloneGrid(grid)])
    setGrid((prev) => {
      const next = cloneGrid(prev)
      next[hint.row]![hint.col] = hint.value
      return next
    })
    setHintCell({ row: hint.row, col: hint.col })
    setHintReason(hint.reason)
    setHintsUsed((n) => n + 1)
  }

  const meta = puzzle.level > 0 ? getLevelMeta(puzzle.level) : null
  const isNewBest =
    cleared && (bestTimeMs === undefined || clearTime < bestTimeMs)

  return (
    <div className="game-screen">
      <div className="game-toolbar">
        <div className="game-meta">
          <span className="mode-label">{modeLabel}</span>
          {puzzle.level > 0 && (
            <h1 className="level-title">Level {puzzle.level}</h1>
          )}
          {puzzle.level === 0 && <h1 className="level-title">Random puzzle</h1>}
          <div className="badges">
            <span
              className="badge"
              style={{ color: difficultyColor(puzzle.difficulty) }}
            >
              {difficultyLabel(puzzle.difficulty)}
            </span>
            <span className="badge muted">
              {puzzle.size}×{puzzle.size}
            </span>
            {meta && <span className="badge muted">{meta.label}</span>}
          </div>
        </div>

        <div className="timers">
          <div className="timer-block">
            <span className="timer-label">Time</span>
            <span className="timer-value">{formatTime(elapsed)}</span>
          </div>
          <div className="timer-block">
            <span className="timer-label">Best</span>
            <span className="timer-value best">
              {bestTimeMs !== undefined ? formatTime(bestTimeMs) : '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="game-main">
        <Board
          grid={grid}
          constraints={puzzle.constraints}
          givens={givens}
          violations={violations}
          hintCell={hintCell}
          onCellClick={cycleCell}
          disabled={cleared}
        />

        <div className="actions">
          <button type="button" className="btn ghost" onClick={undo} disabled={history.length === 0 || cleared}>
            Undo
          </button>
          <button type="button" className="btn ghost" onClick={resetBoard}>
            Reset
          </button>
          <button type="button" className="btn accent" onClick={useHint} disabled={cleared}>
            Hint {hintsUsed > 0 ? `(${hintsUsed})` : ''}
          </button>
        </div>

        {hintReason && (
          <p className="hint-reason" role="status">
            {hintReason}
          </p>
        )}
      </div>

      {cleared && (
        <div className="clear-modal" role="dialog" aria-label="Level cleared">
          <div className="clear-card">
            <p className="clear-eyebrow">Cleared</p>
            <h2>{puzzle.level > 0 ? `Level ${puzzle.level}` : 'Random puzzle'}</h2>
            <p className="clear-time">{formatTime(clearTime)}</p>
            {isNewBest && <p className="new-best">New personal best!</p>}
            {!isNewBest && bestTimeMs !== undefined && (
              <p className="vs-best">
                Best: {formatTime(bestTimeMs)}
                {clearTime > bestTimeMs
                  ? ` (+${formatTime(clearTime - bestTimeMs)})`
                  : ''}
              </p>
            )}
            {hintsUsed > 0 && (
              <p className="hint-count">{hintsUsed} hint{hintsUsed === 1 ? '' : 's'} used</p>
            )}
            <div className="clear-actions">
              {onNext && (
                <button type="button" className="btn accent" onClick={onNext}>
                  {nextLabel}
                </button>
              )}
              <button type="button" className="btn ghost" onClick={resetBoard}>
                Play again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
