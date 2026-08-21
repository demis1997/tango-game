import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameBoard } from './GameBoard'
import { findHint } from '../engine/hints'
import { cloneGrid, getViolations, isComplete } from '../engine/rules'
import type { CellValue, HintResult, Puzzle } from '../engine/types'
import {
  cloneSessionGrid,
  emptySession,
  formatTime,
  type PuzzleSession,
} from '../store/appData'
import './GamePlay.css'

export interface GamePlayProps {
  puzzle: Puzzle
  eyebrow: string
  heading: string
  subheading: string
  streak?: number
  initialSession?: PuzzleSession | null
  onSessionChange?: (session: PuzzleSession) => void
  onComplete?: (payload: {
    timeMs: number
    hintsUsed: number
    mistakes: number
  }) => void
  actions?: React.ReactNode
}

export function GamePlay({
  puzzle,
  eyebrow,
  heading,
  subheading,
  streak,
  initialSession,
  onSessionChange,
  onComplete,
  actions,
}: GamePlayProps) {
  const givens = useMemo(
    () => puzzle.grid.map((row) => row.map((c) => c !== null)),
    [puzzle],
  )

  const boot =
    initialSession && initialSession.seed === puzzle.seed ? initialSession : null

  const [grid, setGrid] = useState<CellValue[][]>(() =>
    cloneSessionGrid(boot?.grid ?? puzzle.grid),
  )
  const [past, setPast] = useState<CellValue[][][]>([])
  const [future, setFuture] = useState<CellValue[][][]>([])
  const [elapsedMs, setElapsedMs] = useState(boot?.elapsedMs ?? 0)
  const [started, setStarted] = useState(boot?.started ?? false)
  const [completed, setCompleted] = useState(boot?.completed ?? false)
  const [hintsUsed, setHintsUsed] = useState(boot?.hintsUsed ?? 0)
  const [mistakes, setMistakes] = useState(boot?.mistakes ?? 0)
  const [hint, setHint] = useState<HintResult | null>(null)
  const [hintText, setHintText] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const reported = useRef(boot?.completed ?? false)
  const onCompleteRef = useRef(onComplete)
  const onSessionRef = useRef(onSessionChange)

  useEffect(() => {
    onCompleteRef.current = onComplete
    onSessionRef.current = onSessionChange
  }, [onComplete, onSessionChange])

  useEffect(() => {
    reported.current = false
    setHint(null)
    setHintText(null)
    setPast([])
    setFuture([])
    setConfirmReset(false)
    if (initialSession && initialSession.seed === puzzle.seed) {
      setGrid(cloneSessionGrid(initialSession.grid))
      setElapsedMs(initialSession.elapsedMs)
      setStarted(initialSession.started)
      setCompleted(initialSession.completed)
      setHintsUsed(initialSession.hintsUsed)
      setMistakes(initialSession.mistakes)
      reported.current = initialSession.completed
    } else {
      setGrid(cloneSessionGrid(puzzle.grid))
      setElapsedMs(0)
      setStarted(false)
      setCompleted(false)
      setHintsUsed(0)
      setMistakes(0)
    }
  }, [puzzle.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(
    (partial: {
      grid: CellValue[][]
      elapsedMs: number
      started: boolean
      completed: boolean
      hintsUsed: number
      mistakes: number
    }) => {
      onSessionRef.current?.({
        seed: puzzle.seed,
        history: [],
        historyIndex: -1,
        updatedAt: Date.now(),
        ...partial,
      })
    },
    [puzzle.seed],
  )

  useEffect(() => {
    if (!started || completed) return
    const base = Date.now() - elapsedMs
    const id = window.setInterval(() => {
      const next = Date.now() - base
      setElapsedMs(next)
    }, 250)
    return () => clearInterval(id)
  }, [started, completed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist timer periodically
  useEffect(() => {
    if (!started || completed) return
    const id = window.setInterval(() => {
      setElapsedMs((ms) => {
        persist({
          grid,
          elapsedMs: ms,
          started: true,
          completed: false,
          hintsUsed,
          mistakes,
        })
        return ms
      })
    }, 2000)
    return () => clearInterval(id)
  }, [started, completed, grid, hintsUsed, mistakes, persist])

  useEffect(() => {
    if (completed || reported.current) return
    if (!isComplete(grid, puzzle.constraints)) return
    reported.current = true
    setCompleted(true)
    setStarted(true)
    persist({
      grid,
      elapsedMs,
      started: true,
      completed: true,
      hintsUsed,
      mistakes,
    })
    onCompleteRef.current?.({ timeMs: elapsedMs, hintsUsed, mistakes })
  }, [grid, puzzle.constraints, completed, elapsedMs, hintsUsed, mistakes, persist])

  const cycleCell = (r: number, c: number, reverse: boolean) => {
    if (completed || givens[r]![c]) return
    const cur = grid[r]![c]
    const nextVal: CellValue = !reverse
      ? cur === null
        ? 0
        : cur === 0
          ? 1
          : null
      : cur === null
        ? 1
        : cur === 1
          ? 0
          : null

    setPast((p) => [...p.slice(-80), cloneSessionGrid(grid)])
    setFuture([])
    const next = cloneGrid(grid)
    next[r]![c] = nextVal
    setGrid(next)
    setHint(null)

    let nextMistakes = mistakes
    if (nextVal !== null && nextVal !== puzzle.solution[r]![c]) {
      nextMistakes = mistakes + 1
      setMistakes(nextMistakes)
    }
    if (!started) setStarted(true)
    persist({
      grid: next,
      elapsedMs,
      started: true,
      completed: false,
      hintsUsed,
      mistakes: nextMistakes,
    })
  }

  const doUndo = () => {
    if (!past.length || completed) return
    const prev = past[past.length - 1]!
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [cloneSessionGrid(grid), ...f])
    setGrid(cloneSessionGrid(prev))
    setHint(null)
    persist({
      grid: prev,
      elapsedMs,
      started,
      completed: false,
      hintsUsed,
      mistakes,
    })
  }

  const doRedo = () => {
    if (!future.length || completed) return
    const nxt = future[0]!
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, cloneSessionGrid(grid)])
    setGrid(cloneSessionGrid(nxt))
    setHint(null)
    persist({
      grid: nxt,
      elapsedMs,
      started,
      completed: false,
      hintsUsed,
      mistakes,
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        doUndo()
      } else if (
        e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault()
        doRedo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onHint = () => {
    if (completed) return
    const h = findHint(grid, puzzle.constraints, puzzle.solution)
    if (!h) return
    setPast((p) => [...p.slice(-80), cloneSessionGrid(grid)])
    setFuture([])
    const next = cloneGrid(grid)
    next[h.row]![h.col] = h.value
    setGrid(next)
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    setHint(h)
    setHintText(h.reason)
    if (!started) setStarted(true)
    persist({
      grid: next,
      elapsedMs,
      started: true,
      completed: false,
      hintsUsed: nextHints,
      mistakes,
    })
  }

  const reset = () => {
    reported.current = false
    setPast([])
    setFuture([])
    setHint(null)
    setHintText(null)
    setConfirmReset(false)
    const fresh = emptySession(puzzle.seed, puzzle.grid)
    setGrid(fresh.grid)
    setElapsedMs(0)
    setStarted(false)
    setCompleted(false)
    setHintsUsed(0)
    setMistakes(0)
    onSessionRef.current?.(fresh)
  }

  const requestReset = () => {
    const hasProgress = grid.some((row, r) =>
      row.some((cell, c) => !givens[r]![c] && cell !== null),
    )
    if (hasProgress && !completed) setConfirmReset(true)
    else reset()
  }

  const violations = useMemo(
    () => getViolations(grid, puzzle.constraints),
    [grid, puzzle.constraints],
  )

  return (
    <div className="game-play">
      <div className="game-play-head">
        <div className="game-play-copy">
          <p className="eyebrow">
            {eyebrow}
            {streak != null && streak > 0 && (
              <span className="streak">🔥 {streak}</span>
            )}
          </p>
          <h1>{heading}</h1>
          <p className="sub">{subheading}</p>
        </div>
        <div className="timer" aria-live="polite">
          {formatTime(elapsedMs)}
        </div>
      </div>

      <div className="board-wrap">
        <GameBoard
          grid={grid}
          constraints={puzzle.constraints}
          givens={givens}
          violations={violations}
          hint={hint}
          disabled={completed}
          onCycle={cycleCell}
        />
      </div>

      <div className="controls">
        <button
          type="button"
          className="ctrl"
          onClick={doUndo}
          disabled={!past.length || completed}
        >
          Undo
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={doRedo}
          disabled={!future.length || completed}
        >
          Redo
        </button>
        <button
          type="button"
          className="ctrl accent"
          onClick={onHint}
          disabled={completed}
        >
          Hint
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={requestReset}
          disabled={completed}
        >
          Reset
        </button>
      </div>

      <p className="gesture-hint">
        Tap to cycle · Right-click or long-press to reverse
      </p>

      {hintText && <p className="hint-copy">{hintText}</p>}

      {!completed && actions && <div className="inline-actions">{actions}</div>}

      {completed && (
        <div className="complete-overlay" role="dialog" aria-label="Completed">
          <div className="complete-card animate-in">
            <p className="complete-check">✓</p>
            <h2>Tango complete</h2>
            <p className="complete-time">{formatTime(elapsedMs)}</p>
            {mistakes === 0 && hintsUsed === 0 && (
              <p className="perfect">Perfect solve</p>
            )}
            <p className="complete-meta">
              {mistakes} mistake{mistakes === 1 ? '' : 's'} · {hintsUsed} hint
              {hintsUsed === 1 ? '' : 's'}
            </p>
            {streak != null && streak > 0 && (
              <p className="complete-streak">🔥 {streak} day streak</p>
            )}
            {actions && <div className="complete-actions">{actions}</div>}
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="complete-overlay" role="dialog">
          <div className="complete-card">
            <h2>Reset puzzle?</h2>
            <p className="complete-meta">
              Your progress on this board will be cleared.
            </p>
            <div className="complete-actions">
              <button type="button" className="ctrl accent" onClick={reset}>
                Reset
              </button>
              <button
                type="button"
                className="ctrl"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
