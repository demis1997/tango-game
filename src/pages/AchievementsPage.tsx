import { ACHIEVEMENTS } from '../data/achievements'
import { useApp } from '../store/AppContext'
import './AchievementsPage.css'

export function AchievementsPage() {
  const { data } = useApp()
  const earned = new Set(data.achievements)

  return (
    <div className="achievements page">
      <header className="page-head">
        <h1>Achievements</h1>
        <p className="lede">
          {earned.size} / {ACHIEVEMENTS.length} unlocked — earn avatars, borders,
          and titles in Campaign.
        </p>
      </header>

      <div className="ach-list">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = earned.has(a.id)
          return (
            <article
              key={a.id}
              className={`ach-card ${unlocked ? 'on' : 'off'}`}
            >
              <span className="ach-icon" aria-hidden>
                {a.icon}
              </span>
              <div>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <div className="rewards">
                  {a.unlockAvatar && <span>Avatar</span>}
                  {a.unlockBorder && <span>Border: {a.unlockBorder}</span>}
                  {a.unlockTitle && <span>Title: {a.unlockTitle}</span>}
                </div>
              </div>
              <span className="status">{unlocked ? 'Earned' : 'Locked'}</span>
            </article>
          )
        })}
      </div>
    </div>
  )
}
