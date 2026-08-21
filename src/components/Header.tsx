import { Link, NavLink } from 'react-router-dom'
import { getBorder, getIcon, getTitle, type GameState } from '../store/progress'
import './Header.css'

interface HeaderProps {
  state: GameState
}

export function Header({ state }: HeaderProps) {
  const icon = getIcon(state.profile.iconId)
  const border = getBorder(state.profile.borderId)
  const title = getTitle(state.profile.titleId)

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark" aria-hidden>
          ∞
        </span>
        <span className="brand-text">Tango</span>
      </Link>

      <nav className="nav">
        <NavLink to="/play">Play</NavLink>
        <NavLink to="/levels">Levels</NavLink>
        <NavLink to="/random">Random</NavLink>
        <NavLink to="/achievements">Achievements</NavLink>
        <NavLink to="/how-to-play">How to play</NavLink>
      </nav>

      <Link to="/profile" className={`profile-chip border-${border.id}`}>
        <span className="profile-icon">{icon.emoji}</span>
        <span className="profile-meta">
          <span className="profile-name">{state.profile.name}</span>
          <span className="profile-title">{title.label}</span>
        </span>
      </Link>
    </header>
  )
}
