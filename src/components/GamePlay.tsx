import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameBoard } from './GameBoard'
import { findHint } from '../engine/hints'
import { cloneGrid, getViolations, isComplete } from '../engine/rules'
import { explainViolations } from '../engine/validator'
import type { CellValue, HintResult, Puzzle } from '../engine/types'
import {
  buildShareText,
  shareOrCopy,
} from '../lib/share'
import {
  cloneSessionGrid,
  countFullBoardMistakes,
  emptySession,
  formatTime,
  type PuzzleSession,
} from '../store/appData'
import { useApp } from '../store/AppContext'
import './GamePlay.css'

export interface GamePlayProps {
  puzzle: Puzzle
  eyebrow: string
  heading: string
  subheading: string
  streak?: number
  shareTitle?: string
  initialSession?: PuzzleSession | null
  onSessionChange?: (session: PuzzleSession) => void
  onComplete?: (payload: {
    timeMs: number
    hintsUsed: number
    mistakes: number
    undos: number
  }) => void
  actions?: React.ReactNode
  showNewPuzzle?: boolean
  onNewPuzzle?: () => void
}

export function GamePlay({
  puzzle,
  eyebrow,
  heading,
  subheading,
  streak,
  shareTitle,
  initialSession,
  onSessionChange,
  onComplete,
  actions,
  showNewPuzzle,
  onNewPuzzle,
}: GamePlayProps) {
  const { data } = useApp()
  const settings = data.settings
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
  const [undos, setUndos] = useState(0)
  const [hint, setHint] = useState<HintResult | null>(null)
  const [hintText, setHintText] = useState<string | null>(null)
  const [pendingHint, setPendingHint] = useState<HintResult | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [checkMsg, setCheckMsg] = useState<string | null>(null)
  const [checkedViolations, setCheckedViolations] = useState<
    { row: number; col: number }[]
  >([])
  const [toast, setToast] = useState<string | null>(null)
  const [focus, setFocus] = useState<{ row: number; col: number } | null>(null)
  const reported = useRef(boot?.completed ?? false)
  const onCompleteRef = useRef(onComplete)
  const onSessionRef = useRef(onSessionChange)
  const elapsedRef = useRef(elapsedMs)

  useEffect(() => {
    elapsedRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    onCompleteRef.current = onComplete
    onSessionRef.current = onSessionChange
  }, [onComplete, onSessionChange])

  useEffect(() => {
    document.documentElement.classList.toggle(
      'high-contrast',
      settings.highContrast,
    )
  }, [settings.highContrast])

  useEffect(() => {
    reported.current = false
    setHint(null)
    setHintText(null)
    setPendingHint(null)
    setPast([])
    setFuture([])
    setConfirmReset(false)
    setConfirmNew(false)
    setCheckMsg(null)
    setCheckedViolations([])
    setUndos(0)
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

  // Timer — pauses when tab hidden
  useEffect(() => {
    if (!started || completed) return
    let base = Date.now() - elapsedRef.current
    const tick = () => {
      if (document.hidden) return
      const next = Date.now() - base
      setElapsedMs(next)
    }
    const onVis = () => {
      if (document.hidden) {
        elapsedRef.current = Date.now() - base
      } else {
        base = Date.now() - elapsedRef.current
      }
    }
    const id = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [started, completed])

  useEffect(() => {
    if (!started || completed) return
    const id = window.setInterval(() => {
      persist({
        grid,
        elapsedMs: elapsedRef.current,
        started: true,
        completed: false,
        hintsUsed,
        mistakes,
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
    const timeMs = elapsedRef.current
    persist({
      grid,
      elapsedMs: timeMs,
      started: true,
      completed: true,
      hintsUsed,
      mistakes,
    })
    onCompleteRef.current?.({
      timeMs,
      hintsUsed,
      mistakes,
      undos,
    })
  }, [grid, puzzle.constraints, completed, hintsUsed, mistakes, undos, persist])

  const applyGrid = (
    next: CellValue[][],
    opts?: { countUndo?: boolean },
  ) => {
    setGrid(next)
    setHint(null)
    setPendingHint(null)
    setHintText(null)
    setCheckedViolations([])
    setCheckMsg(null)
    const nextMistakes = countFullBoardMistakes(next, puzzle.solution)
    setMistakes(nextMistakes)
    if (!started) setStarted(true)
    if (opts?.countUndo) setUndos((u) => u + 1)
    persist({
      grid: next,
      elapsedMs: elapsedRef.current,
      started: true,
      completed: false,
      hintsUsed,
      mistakes: nextMistakes,
    })
  }

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
    applyGrid(next)
  }

  const setValue = (r: number, c: number, value: CellValue) => {
    if (completed || givens[r]![c]) return
    if (grid[r]![c] === value) return
    setPast((p) => [...p.slice(-80), cloneSessionGrid(grid)])
    setFuture([])
    const next = cloneGrid(grid)
    next[r]![c] = value
    applyGrid(next)
  }

  const doUndo = () => {
    if (!past.length || completed) return
    const prev = past[past.length - 1]!
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [cloneSessionGrid(grid), ...f])
    applyGrid(cloneSessionGrid(prev), { countUndo: true })
  }

  const doRedo = () => {
    if (!future.length || completed) return
    const nxt = future[0]!
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, cloneSessionGrid(grid)])
    applyGrid(cloneSessionGrid(nxt))
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
    if (pendingHint) {
      const h = pendingHint
      setPast((p) => [...p.slice(-80), cloneSessionGrid(grid)])
      setFuture([])
      const next = cloneGrid(grid)
      next[h.row]![h.col] = h.value
      const nextHints = hintsUsed + 1
      setHintsUsed(nextHints)
      setPendingHint(null)
      setHint(h)
      applyGrid(next)
      persist({
        grid: next,
        elapsedMs: elapsedRef.current,
        started: true,
        completed: false,
        hintsUsed: nextHints,
        mistakes: countFullBoardMistakes(next, puzzle.solution),
      })
      return
    }
    const h = findHint(grid, puzzle.constraints, puzzle.solution)
    if (!h) {
      setCheckMsg('No forced move found right now — keep looking.')
      return
    }
    setPendingHint(h)
    setHint(h)
    setHintText(h.reason)
    if (!started) setStarted(true)
  }

  const onCheck = () => {
    const explained = explainViolations(grid, puzzle.constraints)
    if (explained.length === 0) {
      const empty = grid.some((row) => row.some((c) => c === null))
      setCheckedViolations([])
      setCheckMsg(
        empty
          ? 'No definite errors yet — keep going.'
          : isComplete(grid, puzzle.constraints)
            ? 'Looks complete!'
            : 'Board is full but something is still off.',
      )
      return
    }
    const cells = explained.flatMap((e) => e.cells)
    setCheckedViolations(cells)
    setCheckMsg(explained[0]!.message)
  }

  const reset = () => {
    reported.current = false
    setPast([])
    setFuture([])
    setHint(null)
    setHintText(null)
    setPendingHint(null)
    setConfirmReset(false)
    setCheckMsg(null)
    setCheckedViolations([])
    setUndos(0)
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

  const liveViolations = useMemo(() => {
    if (settings.validationMode === 'live') {
      return getViolations(grid, puzzle.constraints)
    }
    return checkedViolations
  }, [settings.validationMode, grid, puzzle.constraints, checkedViolations])

  const onShare = async () => {
    const text = buildShareText({
      title: shareTitle ?? `${eyebrow} — ${heading}`,
      timeMs: elapsedMs,
      hintsUsed,
      mistakes,
      streak,
      seed: puzzle.seed,
    })
    const mode = await shareOrCopy(text)
    setToast(mode === 'shared' ? 'Shared' : 'Result copied')
    window.setTimeout(() => setToast(null), 1600)
  }

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
          violations={liveViolations}
          hint={hint}
          disabled={completed}
          symbolStyle={settings.symbolStyle}
          focusCell={focus}
          onFocusCell={(r, c) => setFocus({ row: r, col: c })}
          onCycle={cycleCell}
          onSetValue={setValue}
        />
      </div>

      <div className="controls" role="toolbar" aria-label="Game controls">
        <button
          type="button"
          className="ctrl"
          onClick={doUndo}
          disabled={!past.length || completed}
          title="Undo (Ctrl/Cmd+Z)"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={doRedo}
          disabled={!future.length || completed}
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          ↪ Redo
        </button>
        <button
          type="button"
          className="ctrl accent"
          onClick={onHint}
          disabled={completed}
          title="Get a logical hint"
        >
          {pendingHint ? '✓ Apply hint' : '💡 Hint'}
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={onCheck}
          disabled={completed}
          title="Check for definite rule errors"
        >
          ✓ Check
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={requestReset}
          disabled={completed}
          title="Restart this puzzle"
        >
          ↻ Restart
        </button>
        {showNewPuzzle && onNewPuzzle && (
          <button
            type="button"
            className="ctrl"
            onClick={() => {
              const hasProgress = grid.some((row, r) =>
                row.some((cell, c) => !givens[r]![c] && cell !== null),
              )
              if (hasProgress && !completed) setConfirmNew(true)
              else onNewPuzzle()
            }}
            title="Generate a new puzzle"
          >
            ✦ New
          </button>
        )}
      </div>

      <p className="gesture-hint">
        Tap to cycle · Right-click / long-press reverse · Arrows + S / M / Delete
      </p>

      {(hintText || checkMsg) && (
        <p className="hint-copy" role="status">
          {hintText ?? checkMsg}
        </p>
      )}

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
              {hintsUsed === 1 ? '' : 's'} · {undos} undo
              {undos === 1 ? '' : 's'}
            </p>
            {streak != null && streak > 0 && (
              <p className="complete-streak">🔥 {streak} day streak</p>
            )}
            <div className="complete-actions">
              <button type="button" className="link-btn primary" onClick={onShare}>
                Share Results
              </button>
              {actions}
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="complete-overlay" role="dialog">
          <div className="complete-card">
            <h2>Restart puzzle?</h2>
            <p className="complete-meta">Your progress on this board will be cleared.</p>
            <div className="complete-actions">
              <button type="button" className="ctrl accent" onClick={reset}>
                Restart
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

      {confirmNew && onNewPuzzle && (
        <div className="complete-overlay" role="dialog">
          <div className="complete-card">
            <h2>New puzzle?</h2>
            <p className="complete-meta">Leave this board and generate another?</p>
            <div className="complete-actions">
              <button
                type="button"
                className="ctrl accent"
                onClick={() => {
                  setConfirmNew(false)
                  onNewPuzzle()
                }}
              >
                New puzzle
              </button>
              <button
                type="button"
                className="ctrl"
                onClick={() => setConfirmNew(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="play-toast">{toast}</div>}
    </div>
  )
}
