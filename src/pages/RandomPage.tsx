import { useMemo, useState } from 'react'
import { GameScreen } from '../components/GameScreen'
import { generateRandomPuzzle, difficultyLabel } from '../engine/levels'
import type { Difficulty } from '../engine/types'
import {
  recordRandomClear,
  type GameState,
} from '../store/progress'

interface RandomPageProps {
  state: GameState
  setState: (s: GameState) => void
}

export function RandomPage({ state, setState }: RandomPageProps) {
  const [seed, setSeed] = useState(() => Date.now())
  const [size, setSize] = useState<number | 'any'>('any')
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any')

  const puzzle = useMemo(
    () =>
      generateRandomPuzzle(seed, {
        size: size === 'any' ? undefined : size,
        difficulty: difficulty === 'any' ? undefined : difficulty,
      }),
    [seed, size, difficulty],
  )

  return (
    <div className="page">
      <div className="random-controls">
        <label>
          Size
          <select
            value={size}
            onChange={(e) =>
              setSize(e.target.value === 'any' ? 'any' : Number(e.target.value))
            }
          >
            <option value="any">Any</option>
            <option value="4">4×4</option>
            <option value="6">6×6</option>
            <option value="8">8×8</option>
            <option value="10">10×10</option>
          </select>
        </label>
        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value === 'any'
                  ? 'any'
                  : (e.target.value as Difficulty),
              )
            }
          >
            <option value="any">Any</option>
            {(['easy', 'medium', 'hard', 'very-hard'] as Difficulty[]).map(
              (d) => (
                <option key={d} value={d}>
                  {difficultyLabel(d)}
                </option>
              ),
            )}
          </select>
        </label>
        <button
          type="button"
          className="btn accent"
          onClick={() => setSeed(Date.now() ^ (Math.random() * 1e9))}
        >
          New random
        </button>
      </div>

      <GameScreen
        key={seed}
        puzzle={puzzle}
        modeLabel="Randomizer"
        onClear={() => setState(recordRandomClear(state))}
        onNext={() => setSeed(Date.now() ^ (Math.random() * 1e9))}
        nextLabel="Another random"
      />
    </div>
  )
}
