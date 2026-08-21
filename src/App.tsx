import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteHeader } from './components/SiteHeader'
import { AchievementsPage } from './pages/AchievementsPage'
import { ArchivePage } from './pages/ArchivePage'
import { CampaignPage } from './pages/CampaignPage'
import { HomePage } from './pages/HomePage'
import { HowToPlayPage } from './pages/HowToPlayPage'
import { PlayPage } from './pages/PlayPage'
import { ProfilePage } from './pages/ProfilePage'
import { StatsPage } from './pages/StatsPage'
import { AppProvider } from './store/AppContext'
import './App.css'

export default function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <SiteHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily" element={<Navigate to="/" replace />} />
            <Route path="/campaign" element={<CampaignPage />} />
            <Route path="/campaign/:levelId" element={<CampaignPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/play/:seed" element={<PlayPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/archive/:date" element={<ArchivePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/how-to-play" element={<HowToPlayPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  )
}
