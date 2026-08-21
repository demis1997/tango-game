import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AVATARS, BORDERS, TITLES } from '../data/achievements'
import { useApp } from '../store/AppContext'
import './SiteHeader.css'

export function SiteHeader() {
  const { data, setTheme } = useApp()
  const [open, setOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(data.theme === 'light' ? 'dark' : 'light')
  }

  const close = () => setOpen(false)

  const avatar =
    AVATARS.find((a) => a.id === data.profile.avatarId) ?? AVATARS[0]
  const border =
    BORDERS.find((b) => b.id === data.profile.borderId) ?? BORDERS[0]
  const title =
    TITLES.find((t) => t.id === data.profile.titleId) ?? TITLES[0]

  return (
    <header className="site-header">
      <Link to="/" className="brand" onClick={close}>
        <span className="brand-mark" aria-hidden>
          ●
        </span>
        Tango
      </Link>

      <nav className={`nav ${open ? 'open' : ''}`}>
        <NavLink to="/" end onClick={close}>
          Daily
        </NavLink>
        <NavLink to="/campaign" onClick={close}>
          Campaign
        </NavLink>
        <NavLink to="/play" onClick={close}>
          Unlimited
        </NavLink>
        <NavLink to="/archive" onClick={close}>
          Archive
        </NavLink>
        <NavLink to="/achievements" onClick={close}>
          Achievements
        </NavLink>
        <NavLink to="/how-to-play" onClick={close}>
          How to Play
        </NavLink>
        <NavLink to="/stats" onClick={close}>
          Stats
        </NavLink>
      </nav>

      <div className="header-actions">
        <Link
          to="/profile"
          className={`profile-chip border-${border.id}`}
          onClick={close}
          title={title.label}
        >
          <span className="chip-avatar">{avatar.emoji}</span>
        </Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            data.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          }
        >
          {data.theme === 'light' ? '☾' : '☀'}
        </button>
        <button
          type="button"
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
