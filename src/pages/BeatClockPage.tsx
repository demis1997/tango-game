import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GamePlay } from '../components/GamePlay'
import { getNewUnlimitedPuzzle, getPuzzleBySeed } from '../engine/factory'
import { difficultyLabel } from '../engine/seeds'
import { useApp } from '../store/AppContext'
import './PlayPage.css'

/** Secondary mode: chain medium boards; track local best clears. */
export function BeatClockPage() {
  const { data, setBeatBest } = useApp()
  const [seed, setSeed] = useState(() => getNewUnlimitedPuzzle(6, 'medium').seed)
  const [solved, setSolved] = useState(0)

  const puzzle = useMemo(() => {
    return getPuzzleBySeed(seed) ?? getNewUnlimitedPuzzle(6, 'medium')
  }, [seed])

  const nextBoard = () => {
    const p = getNewUnlimitedPuzzle(6, 'medium')
    setSeed(p.seed)
  }

  return (
    <div className="play-page">
      <div className="diff-bar">
        <span className="diff-label">Beat the Clock</span>
        <span className="diff-pill active">Session {solved}</span>
        <span className="diff-pill">Best {data.beatBestScore}</span>
        <Link className="diff-pill" to="/">
          Daily
        </Link>
      </div>
      <GamePlay
        key={puzzle.seed}
        puzzle={puzzle}
        eyebrow="Beat the Clock"
        heading="Speed chain"
        subheading={`${difficultyLabel(puzzle.difficulty)} · ${puzzle.size}×${puzzle.size}`}
        onComplete={() => {
          const next = solved + 1
          setSolved(next)
          setBeatBest(next)
          nextBoard()
        }}
        showNewPuzzle
        onNewPuzzle={nextBoard}
        actions={
          <button type="button" className="link-btn primary" onClick={nextBoard}>
            Next Puzzle
          </button>
        }
      />
      <p className="gesture-hint">
        Clear boards back-to-back. Your best session score is saved on this device.
      </p>
    </div>
  )
}
