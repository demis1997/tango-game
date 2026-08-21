import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { GamePlay } from '../components/GamePlay'
import { getDailyPuzzle } from '../engine/factory'
import {
  dateKey,
  difficultyLabel,
  formatDisplayDate,
  parseDateKey,
} from '../engine/seeds'
import { useApp } from '../store/AppContext'
import { formatTime, listMonthDates } from '../store/appData'
import './ArchivePage.css'

export function ArchivePage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { data } = useApp()
  const today = dateKey()
  const now = new Date()
  const days = listMonthDates(now.getFullYear(), now.getMonth())

  useEffect(() => {
    if (date === today) navigate('/', { replace: true })
    if (date && !parseDateKey(date)) navigate('/archive', { replace: true })
  }, [date, today, navigate])

  if (date && date !== today && parseDateKey(date)) {
    return <ArchivePlay date={date} />
  }

  if (date) return null

  const monthLabel = now.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="archive page">
      <header className="page-head">
        <h1>Archive</h1>
        <p className="lede">
          Replay past daily puzzles. Archive clears don’t change your streak.
        </p>
      </header>

      <h2 className="month">{monthLabel}</h2>
      <div className="archive-list">
        {days.map((key) => {
          const rec = data.dailyRecords[key]
          const d = new Date(key + 'T12:00:00')
          const dayNum = d.getDate()
          return (
            <Link
              key={key}
              to={key === today ? '/' : `/archive/${key}`}
              className={`archive-row ${rec?.completed ? 'done' : ''}`}
            >
              <span className="day">{dayNum}</span>
              <span className="status">
                {key === today
                  ? 'Today'
                  : rec?.completed
                    ? 'Completed'
                    : 'Not played'}
              </span>
              <span className="time">
                {rec?.completed && rec.timeMs != null
                  ? formatTime(rec.timeMs)
                  : ''}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ArchivePlay({ date }: { date: string }) {
  const { data, saveDailySession } = useApp()
  const puzzle = useMemo(() => getDailyPuzzle(date), [date])
  const navigate = useNavigate()

  return (
    <div className="archive-play">
      <button type="button" className="back" onClick={() => navigate('/archive')}>
        ← Archive
      </button>
      <GamePlay
        key={puzzle.seed}
        puzzle={puzzle}
        eyebrow="Archive"
        heading={formatDisplayDate(date)}
        subheading={`Difficulty: ${difficultyLabel(puzzle.difficulty)}`}
        initialSession={data.daily[date]}
        onSessionChange={(s) => saveDailySession(date, s)}
        actions={
          <>
            <Link className="link-btn primary" to="/">
              Today’s Daily
            </Link>
            <Link className="link-btn" to="/archive">
              Back to Archive
            </Link>
          </>
        }
      />
    </div>
  )
}
