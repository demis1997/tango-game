import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import './SiteHeader.css'

export function SiteHeader() {
  const { data, setTheme } = useApp()
  const [open, setOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(data.theme === 'light' ? 'dark' : 'light')
  }

  const close = () => setOpen(false)

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
        <NavLink to="/play" onClick={close}>
          Unlimited
        </NavLink>
        <NavLink to="/archive" onClick={close}>
          Archive
        </NavLink>
        <NavLink to="/how-to-play" onClick={close}>
          How to Play
        </NavLink>
        <NavLink to="/stats" onClick={close}>
          Stats
        </NavLink>
      </nav>

      <div className="header-actions">
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
