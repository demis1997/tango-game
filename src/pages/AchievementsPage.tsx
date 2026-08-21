import { ACHIEVEMENTS } from '../data/achievements'
import type { GameState } from '../store/progress'
import './AchievementsPage.css'

interface AchievementsPageProps {
  state: GameState
}

export function AchievementsPage({ state }: AchievementsPageProps) {
  const earned = new Set(state.achievements)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Achievements</h1>
        <p className="lede">
          {earned.size} / {ACHIEVEMENTS.length} unlocked — banners & titles for
          speed clears and journey milestones.
        </p>
      </header>

      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = earned.has(a.id)
          return (
            <article
              key={a.id}
              className={`ach-card ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="ach-icon" aria-hidden>
                {a.icon}
              </div>
              <div className="ach-body">
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <div className="ach-rewards">
                  <span className="banner-tag">{a.banner}</span>
                  {a.unlockTitle && (
                    <span className="reward">Title: {a.unlockTitle}</span>
                  )}
                  {a.unlockBorder && (
                    <span className="reward">Border: {a.unlockBorder}</span>
                  )}
                </div>
              </div>
              <span className="ach-status">{unlocked ? 'Earned' : 'Locked'}</span>
            </article>
          )
        })}
      </div>
    </div>
  )
}
