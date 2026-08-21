import { Link } from 'react-router-dom'
import type { GameState } from '../store/progress'
import './HomePage.css'

interface HomePageProps {
  state: GameState
}

export function HomePage({ state }: HomePageProps) {
  const next = state.highestUnlocked

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-sky" aria-hidden>
          <span className="orb sun-orb" />
          <span className="orb moon-orb" />
          <span className="star s1" />
          <span className="star s2" />
          <span className="star s3" />
        </div>
        <div className="hero-copy">
          <p className="hero-brand">∞ Tango</p>
          <h1>Fill the grid with suns and moons.</h1>
          <p className="hero-sub">
            1000 levels from easy to very hard. Beat the clock, unlock banners,
            and dance with logic.
          </p>
          <div className="hero-ctas">
            <Link className="btn accent" to={`/play/${next}`}>
              Continue level {next}
            </Link>
            <Link className="btn ghost" to="/how-to-play">
              How to play
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <Link to="/levels" className="feature">
          <h2>Journey</h2>
          <p>1000 curated-difficulty boards. Clear one, unlock the next.</p>
        </Link>
        <Link to="/random" className="feature">
          <h2>Randomizer</h2>
          <p>Endless puzzles at any size and difficulty you choose.</p>
        </Link>
        <Link to="/achievements" className="feature">
          <h2>Achievements</h2>
          <p>Speed banners, titles, and borders for blistering clears.</p>
        </Link>
        <Link to="/profile" className="feature">
          <h2>Profile</h2>
          <p>Custom icons and borders that show off what you’ve earned.</p>
        </Link>
      </section>
    </div>
  )
}
