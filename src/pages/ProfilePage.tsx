import {
  PROFILE_BORDERS,
  PROFILE_ICONS,
  PROFILE_TITLES,
} from '../data/achievements'
import {
  getBorder,
  getIcon,
  getTitle,
  resetProgress,
  updateProfile,
  type GameState,
} from '../store/progress'
import './ProfilePage.css'

interface ProfilePageProps {
  state: GameState
  setState: (s: GameState) => void
}

export function ProfilePage({ state, setState }: ProfilePageProps) {
  const icon = getIcon(state.profile.iconId)
  const border = getBorder(state.profile.borderId)
  const title = getTitle(state.profile.titleId)

  return (
    <div className="page narrow">
      <header className="page-head">
        <h1>Profile</h1>
        <p className="lede">Customize your icon, border, and title.</p>
      </header>

      <div className={`profile-preview border-${border.id}`}>
        <span className="preview-icon">{icon.emoji}</span>
        <div>
          <input
            className="name-input"
            value={state.profile.name}
            maxLength={20}
            onChange={(e) =>
              setState(updateProfile(state, { name: e.target.value || 'Player' }))
            }
            aria-label="Display name"
          />
          <p className="preview-title">{title.label}</p>
        </div>
      </div>

      <section className="profile-section">
        <h2>Icons</h2>
        <div className="option-row">
          {PROFILE_ICONS.map((i) => (
            <button
              key={i.id}
              type="button"
              className={`option-btn ${state.profile.iconId === i.id ? 'selected' : ''}`}
              onClick={() => setState(updateProfile(state, { iconId: i.id }))}
              title={i.label}
            >
              {i.emoji}
            </button>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Borders</h2>
        <div className="option-row">
          {PROFILE_BORDERS.map((b) => {
            const unlocked = state.unlockedBorders.includes(b.id)
            return (
              <button
                key={b.id}
                type="button"
                disabled={!unlocked}
                className={`option-btn border-swatch border-${b.id} ${state.profile.borderId === b.id ? 'selected' : ''}`}
                onClick={() =>
                  unlocked && setState(updateProfile(state, { borderId: b.id }))
                }
                title={unlocked ? b.label : `Locked: ${b.label}`}
              >
                {b.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="profile-section">
        <h2>Titles</h2>
        <div className="title-list">
          {PROFILE_TITLES.map((t) => {
            const unlocked = state.unlockedTitles.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                disabled={!unlocked}
                className={`title-btn ${state.profile.titleId === t.id ? 'selected' : ''}`}
                onClick={() =>
                  unlocked && setState(updateProfile(state, { titleId: t.id }))
                }
              >
                {t.label}
                {!unlocked && <span>Locked</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section className="profile-section danger">
        <h2>Stats</h2>
        <ul className="stats">
          <li>Highest unlocked: Level {state.highestUnlocked}</li>
          <li>Total clears: {state.totalClears}</li>
          <li>Clear streak: {state.streak}</li>
          <li>No-hint clears: {state.noHintClears}</li>
          <li>Random clears: {state.randomClears}</li>
        </ul>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            if (
              confirm(
                'Reset all progress, times, and achievements? This cannot be undone.',
              )
            ) {
              setState(resetProgress())
            }
          }}
        >
          Reset progress
        </button>
      </section>
    </div>
  )
}
