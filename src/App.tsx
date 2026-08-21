import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Header } from './components/Header'
import { AchievementsPage } from './pages/AchievementsPage'
import { HomePage } from './pages/HomePage'
import { HowToPlayPage } from './pages/HowToPlayPage'
import { LevelsPage } from './pages/LevelsPage'
import { PlayPage } from './pages/PlayPage'
import { ProfilePage } from './pages/ProfilePage'
import { RandomPage } from './pages/RandomPage'
import { loadState, type GameState } from './store/progress'
import './App.css'

function PlayRoute({
  state,
  setState,
}: {
  state: GameState
  setState: (s: GameState) => void
}) {
  const { levelId } = useParams()
  const level = Number(levelId)
  if (!Number.isInteger(level) || level < 1 || level > 1000) {
    return <Navigate to={`/play/${state.highestUnlocked}`} replace />
  }
  return <PlayPage state={state} setState={setState} level={level} />
}

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState())

  useEffect(() => {
    document.title = '∞ Tango — Sun & Moon Logic Puzzle'
  }, [])

  return (
    <div className="app-shell">
      <Header state={state} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage state={state} />} />
          <Route
            path="/play"
            element={<Navigate to={`/play/${state.highestUnlocked}`} replace />}
          />
          <Route
            path="/play/:levelId"
            element={<PlayRoute state={state} setState={setState} />}
          />
          <Route path="/levels" element={<LevelsPage state={state} />} />
          <Route
            path="/random"
            element={<RandomPage state={state} setState={setState} />}
          />
          <Route
            path="/achievements"
            element={<AchievementsPage state={state} />}
          />
          <Route
            path="/profile"
            element={<ProfilePage state={state} setState={setState} />}
          />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
