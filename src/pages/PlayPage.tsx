import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GamePlay } from '../components/GamePlay'
import { getNewUnlimitedPuzzle, getPuzzleBySeed } from '../engine/factory'
import { difficultyLabel } from '../engine/seeds'
import type { Difficulty } from '../engine/types'
import { useApp } from '../store/AppContext'
import './PlayPage.css'

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

export function PlayPage() {
  const { seed } = useParams()
  const navigate = useNavigate()
  const { data, saveUnlimitedSession, completeUnlimited } = useApp()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!seed) {
      const p = getNewUnlimitedPuzzle(6, difficulty)
      navigate(`/play/${p.seed}`, { replace: true })
    }
  }, [seed, difficulty, navigate])

  const puzzle = useMemo(() => {
    if (!seed) return null
    return getPuzzleBySeed(seed)
  }, [seed])

  useEffect(() => {
    if (seed && puzzle === null) {
      const p = getNewUnlimitedPuzzle(6, 'medium')
      navigate(`/play/${p.seed}`, { replace: true })
      return
    }
    if (puzzle) setDifficulty(puzzle.difficulty)
  }, [seed, puzzle, navigate])

  const startNew = (d: Difficulty = difficulty) => {
    const p = getNewUnlimitedPuzzle(6, d)
    setDifficulty(d)
    navigate(`/play/${p.seed}`)
  }

  const share = async () => {
    if (!puzzle) return
    const url = `${window.location.origin}/play/${puzzle.seed}`
    await navigator.clipboard.writeText(url)
    setToast('Challenge link copied')
    window.setTimeout(() => setToast(null), 1800)
  }

  const copyResult = async () => {
    if (!puzzle) return
    await navigator.clipboard.writeText(
      `Tango ${puzzle.seed} · ${difficultyLabel(puzzle.difficulty)}`,
    )
    setToast('Result copied')
    window.setTimeout(() => setToast(null), 1800)
  }

  if (!puzzle) {
    return <p className="loading-play">Loading puzzle…</p>
  }

  return (
    <div className="play-page">
      <div className="diff-bar">
        <span className="diff-label">Unlimited</span>
        <div className="diff-pills">
          {DIFFS.map((d) => (
            <button
              key={d}
              type="button"
              className={`diff-pill ${difficulty === d ? 'active' : ''}`}
              onClick={() => startNew(d)}
            >
              {difficultyLabel(d)}
            </button>
          ))}
        </div>
        <button type="button" className="ctrl accent" onClick={() => startNew()}>
          New Puzzle
        </button>
      </div>

      <GamePlay
        key={puzzle.seed}
        puzzle={puzzle}
        eyebrow="Unlimited"
        heading={difficultyLabel(puzzle.difficulty)}
        subheading={`Seed ${puzzle.seed} · ${puzzle.size}×${puzzle.size}`}
        initialSession={data.unlimitedSessions[puzzle.seed]}
        onSessionChange={(s) => saveUnlimitedSession(puzzle.seed, s)}
        onComplete={({ timeMs }) => {
          completeUnlimited(puzzle.difficulty, timeMs)
        }}
        actions={
          <>
            <button
              type="button"
              className="link-btn primary"
              onClick={() => startNew()}
            >
              Next Puzzle
            </button>
            <button type="button" className="link-btn" onClick={share}>
              Share Puzzle
            </button>
            <button type="button" className="link-btn" onClick={copyResult}>
              Copy Result
            </button>
            <Link className="link-btn" to="/stats">
              View Stats
            </Link>
          </>
        }
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
