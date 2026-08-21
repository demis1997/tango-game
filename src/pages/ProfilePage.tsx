import { ACHIEVEMENTS, AVATARS, BORDERS, TITLES } from '../data/achievements'
import { useApp } from '../store/AppContext'
import './ProfilePage.css'

export function ProfilePage() {
  const { data, setProfile } = useApp()
  const avatar =
    AVATARS.find((a) => a.id === data.profile.avatarId) ?? AVATARS[0]
  const border =
    BORDERS.find((b) => b.id === data.profile.borderId) ?? BORDERS[0]
  const title =
    TITLES.find((t) => t.id === data.profile.titleId) ?? TITLES[0]

  return (
    <div className="profile page">
      <header className="page-head">
        <h1>Profile</h1>
        <p className="lede">Avatars and borders unlock from campaign achievements.</p>
      </header>

      <div className={`preview border-${border.id}`}>
        <span className="preview-avatar">{avatar.emoji}</span>
        <div>
          <input
            className="name-input"
            value={data.profile.name}
            maxLength={20}
            aria-label="Display name"
            onChange={(e) =>
              setProfile({ name: e.target.value || 'Player' })
            }
          />
          <p className="preview-title">{title.label}</p>
        </div>
      </div>

      <section>
        <h2>Avatars</h2>
        <div className="option-row">
          {AVATARS.map((a) => {
            const unlocked = data.unlockedAvatars.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                disabled={!unlocked}
                title={unlocked ? a.label : `Locked: ${a.label}`}
                className={`option ${data.profile.avatarId === a.id ? 'selected' : ''}`}
                onClick={() => unlocked && setProfile({ avatarId: a.id })}
              >
                {a.emoji}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2>Borders</h2>
        <div className="option-row">
          {BORDERS.map((b) => {
            const unlocked = data.unlockedBorders.includes(b.id)
            return (
              <button
                key={b.id}
                type="button"
                disabled={!unlocked}
                title={unlocked ? b.label : `Locked: ${b.label}`}
                className={`option text border-${b.id} ${data.profile.borderId === b.id ? 'selected' : ''}`}
                onClick={() => unlocked && setProfile({ borderId: b.id })}
              >
                {b.label}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2>Titles</h2>
        <div className="title-list">
          {TITLES.map((t) => {
            const unlocked = data.unlockedTitles.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                disabled={!unlocked}
                className={`title-btn ${data.profile.titleId === t.id ? 'selected' : ''}`}
                onClick={() => unlocked && setProfile({ titleId: t.id })}
              >
                {t.label}
                {!unlocked && <span>Locked</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2>Campaign</h2>
        <p className="meta">
          Highest unlocked: Level {data.campaignUnlocked} · Achievements:{' '}
          {data.achievements.length}/{ACHIEVEMENTS.length}
        </p>
      </section>
    </div>
  )
}
