import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateLevel } from '../engine/levels'
import { GameScreen } from '../components/GameScreen'
import {
  recordLevelClear,
  type GameState,
} from '../store/progress'
import { ACHIEVEMENTS } from '../data/achievements'

interface PlayPageProps {
  state: GameState
  setState: (s: GameState) => void
  level: number
}

export function PlayPage({ state, setState, level }: PlayPageProps) {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string[] | null>(null)
  const clearGuard = useRef<string | null>(null)

  const locked = level > state.highestUnlocked

  const puzzle = useMemo(() => {
    if (locked) return null
    return generateLevel(level)
  }, [level, locked])

  if (locked) {
    return (
      <div className="page narrow">
        <h1>Level {level} locked</h1>
        <p className="lede">
          Clear level {state.highestUnlocked} first to unlock this one.
        </p>
        <Link className="btn accent" to={`/play/${state.highestUnlocked}`}>
          Continue journey
        </Link>
      </div>
    )
  }

  if (!puzzle) return null

  const best = state.records[String(level)]?.bestTimeMs

  return (
    <div className="page">
      <GameScreen
        key={level}
        puzzle={puzzle}
        bestTimeMs={best}
        modeLabel="Journey"
        onClear={({ timeMs, hintsUsed }) => {
          const token = `${level}:${timeMs}:${hintsUsed}`
          if (clearGuard.current === token) return
          clearGuard.current = token
          const result = recordLevelClear(
            state,
            level,
            timeMs,
            hintsUsed,
            puzzle.difficulty,
          )
          setState(result.state)
          if (result.newAchievements.length) {
            const names = result.newAchievements.map(
              (id) => ACHIEVEMENTS.find((a) => a.id === id)?.title ?? id,
            )
            setToast(names)
          }
        }}
        onNext={() => {
          setToast(null)
          clearGuard.current = null
          if (level < 1000) navigate(`/play/${level + 1}`)
          else navigate('/achievements')
        }}
        nextLabel={level < 1000 ? `Level ${level + 1}` : 'View achievements'}
      />

      {toast && (
        <div className="toast" role="status">
          <strong>Achievement unlocked</strong>
          <ul>
            {toast.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button type="button" className="btn ghost" onClick={() => setToast(null)}>
            Nice
          </button>
        </div>
      )}
    </div>
  )
}
