import { Link } from 'react-router-dom'
import {
  TOTAL_LEVELS,
  difficultyColor,
  difficultyLabel,
  getLevelMeta,
} from '../engine/levels'
import { formatTime, type GameState } from '../store/progress'
import './LevelsPage.css'

interface LevelsPageProps {
  state: GameState
}

export function LevelsPage({ state }: LevelsPageProps) {
  const unlocked = state.highestUnlocked

  return (
    <div className="page">
      <header className="page-head">
        <h1>Journey — 1000 levels</h1>
        <p className="lede">
          Cleared through level {Math.max(0, unlocked - 1)}. Next up:{' '}
          <Link to={`/play/${unlocked}`}>Level {unlocked}</Link>
        </p>
      </header>

      <div className="level-grid">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
          const level = i + 1
          const meta = getLevelMeta(level)
          const isLocked = level > unlocked
          const record = state.records[String(level)]
          const isCurrent = level === unlocked

          return (
            <Link
              key={level}
              to={isLocked ? '#' : `/play/${level}`}
              className={[
                'level-tile',
                isLocked ? 'locked' : '',
                isCurrent ? 'current' : '',
                record ? 'cleared' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={(e) => isLocked && e.preventDefault()}
              aria-disabled={isLocked}
              title={
                isLocked
                  ? 'Locked'
                  : `${difficultyLabel(meta.difficulty)} · ${meta.size}×${meta.size}`
              }
            >
              <span className="level-num">{level}</span>
              <span
                className="level-diff"
                style={{ background: difficultyColor(meta.difficulty) }}
              />
              {record && (
                <span className="level-time">{formatTime(record.bestTimeMs)}</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
