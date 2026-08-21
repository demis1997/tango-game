import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)' }}>Page not found</h1>
      <p style={{ color: 'var(--muted)' }}>That route doesn’t exist.</p>
      <Link className="link-btn primary" to="/">
        Play Daily
      </Link>
    </div>
  )
}
