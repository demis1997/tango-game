import { Link } from 'react-router-dom'
import { MoonIcon, SunIcon } from '../components/icons'
import './HowToPlayPage.css'

export function HowToPlayPage() {
  return (
    <div className="how page">
      <header className="page-head">
        <h1>How to Play</h1>
        <p className="lede">
          Fill the grid with Suns and Moons using logic — no guessing required.
        </p>
      </header>

      <section>
        <h2>The rules</h2>
        <ol className="steps">
          <li>
            <strong>Fill every cell</strong> with a Sun or a Moon.
            <div className="mini-row" aria-hidden>
              <span className="chip sun">
                <SunIcon />
              </span>
              <span className="chip moon">
                <MoonIcon />
              </span>
            </div>
          </li>
          <li>
            <strong>Balance:</strong> each row and column has the same number of
            Suns and Moons (3 each on a 6×6 board).
          </li>
          <li>
            <strong>No triples:</strong> never place three identical symbols in
            a row or column.
          </li>
          <li>
            <strong>=</strong> means adjacent cells are the <em>same</em>.
          </li>
          <li>
            <strong>×</strong> means adjacent cells are <em>different</em>.
          </li>
          <li>
            Every puzzle has one solution and can be finished by deduction.
          </li>
        </ol>
      </section>

      <section>
        <h2>Strategy</h2>
        <div className="strat">
          <article>
            <h3>Gap technique</h3>
            <p className="diagram">
              <SunIcon /> <span className="dot">·</span> <SunIcon />
            </p>
            <p>Middle must be a Moon — three Suns in a row are illegal.</p>
          </article>
          <article>
            <h3>Doubles rule</h3>
            <p className="diagram">
              <MoonIcon /> <MoonIcon /> <span className="dot">·</span>
            </p>
            <p>After two Moons, the next cell must be a Sun.</p>
          </article>
          <article>
            <h3>Counting</h3>
            <p>
              When a line already has its maximum of one symbol, every remaining
              empty cell is the other.
            </p>
          </article>
          <article>
            <h3>Constraints</h3>
            <p>
              Propagate from known cells along = and × markers — one placement
              often unlocks the next.
            </p>
          </article>
        </div>
      </section>

      <p className="cta">
        <Link className="link-btn primary" to="/">
          Play today’s Daily
        </Link>
        <Link className="link-btn" to="/play">
          Practice Unlimited
        </Link>
      </p>
    </div>
  )
}
