import { useApp } from '../store/AppContext'
import { formatTime } from '../store/appData'
import { difficultyLabel } from '../engine/seeds'
import type { Difficulty } from '../engine/types'
import './StatsPage.css'

export function StatsPage() {
  const { data } = useApp()
  const records = Object.values(data.dailyRecords).filter((r) => r.completed)
  const dailyPlayed = records.length
  const dailyWins = dailyPlayed
  const winRate = dailyPlayed ? 100 : 0
  const times = records
    .map((r) => r.timeMs)
    .filter((t): t is number => typeof t === 'number')
  const best = times.length ? Math.min(...times) : null
  const avg = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null

  const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

  return (
    <div className="stats page">
      <header className="page-head">
        <h1>Stats</h1>
        <p className="lede">Local progress — kept on this device.</p>
      </header>

      <section>
        <h2>Daily</h2>
        <div className="stat-grid">
          <Stat label="Games played" value={String(dailyPlayed)} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Current streak" value={String(data.currentStreak)} />
          <Stat label="Longest streak" value={String(data.longestStreak)} />
          <Stat
            label="Best time"
            value={best != null ? formatTime(best) : '—'}
          />
          <Stat
            label="Average time"
            value={avg != null ? formatTime(avg) : '—'}
          />
        </div>
      </section>

      <section>
        <h2>Unlimited</h2>
        <div className="stat-grid">
          <Stat label="Solved" value={String(data.unlimited.solved)} />
          {diffs.map((d) => (
            <Stat
              key={d}
              label={difficultyLabel(d)}
              value={String(data.unlimited.byDifficulty[d])}
            />
          ))}
        </div>
        {dailyWins === 0 && data.unlimited.solved === 0 && (
          <p className="empty">Solve a puzzle to see your stats grow.</p>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
