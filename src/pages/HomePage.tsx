import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { GamePlay } from '../components/GamePlay'
import { TutorialOverlay } from '../components/Tutorial'
import { getDailyPuzzle } from '../engine/factory'
import {
  dateKey,
  difficultyLabel,
  formatDisplayDate,
} from '../engine/seeds'
import { dailyShareTitle } from '../lib/share'
import { useApp } from '../store/AppContext'
import { formatTime, listRecentDates } from '../store/appData'
import './HomePage.css'

export function HomePage() {
  const { data, saveDailySession, completeDaily } = useApp()
  const today = dateKey()
  const puzzle = useMemo(() => getDailyPuzzle(today), [today])
  const recent = listRecentDates(7)

  return (
    <div className="home">
      <TutorialOverlay />
      <section className="play-stage">
        <GamePlay
          key={puzzle.seed}
          puzzle={puzzle}
          eyebrow="Daily"
          heading={formatDisplayDate(today)}
          subheading={`Difficulty: ${difficultyLabel(puzzle.difficulty)} · ${puzzle.size}×${puzzle.size}`}
          streak={data.currentStreak}
          shareTitle={dailyShareTitle(today)}
          initialSession={data.daily[today]}
          onSessionChange={(s) => saveDailySession(today, s)}
          onComplete={({ timeMs, hintsUsed, mistakes }) => {
            if (!data.dailyRecords[today]?.completed) {
              completeDaily(today, puzzle.seed, timeMs, hintsUsed, mistakes)
            }
          }}
          actions={
            <>
              <Link className="link-btn primary" to="/play">
                Play Unlimited
              </Link>
              <Link className="link-btn" to="/stats">
                View Stats
              </Link>
            </>
          }
        />
      </section>

      <section className="below">
        <div className="recent">
          <div className="section-head">
            <h2>Recent Daily Puzzles</h2>
            <Link to="/archive">View all →</Link>
          </div>
          <div className="recent-row">
            {recent.map((key) => {
              const rec = data.dailyRecords[key]
              const d = new Date(key + 'T12:00:00')
              const label = d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
              return (
                <Link
                  key={key}
                  to={key === today ? '/' : `/archive/${key}`}
                  className={`recent-pill ${rec?.completed ? 'done' : ''} ${key === today ? 'today' : ''}`}
                >
                  <span>{label}</span>
                  <span className="recent-meta">
                    {key === today
                      ? 'Today'
                      : rec?.completed
                        ? `✓ ${formatTime(rec.timeMs ?? 0)}`
                        : '—'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="content-block">
          <h2>How to Play</h2>
          <ul className="rule-list">
            <li>Fill every cell with a Sun or a Moon.</li>
            <li>Each row and column has an equal number of each.</li>
            <li>Never place three identical symbols in a row.</li>
            <li>
              <strong>=</strong> means same · <strong>×</strong> means different.
            </li>
            <li>Every board can be solved by logic alone.</li>
          </ul>
          <Link to="/how-to-play" className="text-link">
            Full guide & strategy →
          </Link>
        </div>

        <div className="content-block">
          <h2>Why play Tango?</h2>
          <p>
            Tango is a fast binary logic puzzle — counting, patterns, and
            constraint chains. Play the shared daily board or unlimited practice
            puzzles with shareable seeds.
          </p>
        </div>

        <div className="content-block faq">
          <h2>FAQ</h2>
          <details>
            <summary>Is this free?</summary>
            <p>Yes. Play in your browser with no account required.</p>
          </details>
          <details>
            <summary>Daily vs Unlimited?</summary>
            <p>
              Daily is one shared puzzle each calendar day. Unlimited generates
              endless boards you can share via a seed link.
            </p>
          </details>
          <details>
            <summary>Can I share a puzzle?</summary>
            <p>
              Yes. Unlimited boards use URLs like <code>/play/6M7K3Q2</code>.
              After finishing, use Share Results for a spoiler-safe scorecard.
            </p>
          </details>
          <details>
            <summary>Is this LinkedIn?</summary>
            <p>
              No. This is an independent practice site and is not affiliated
              with LinkedIn.
            </p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <p>Tango — sun & moon logic puzzles.</p>
        <p>
          <Link to="/how-to-play">How to Play</Link> ·{' '}
          <Link to="/archive">Archive</Link> · <Link to="/stats">Stats</Link> ·{' '}
          <Link to="/settings">Settings</Link>
        </p>
      </footer>
    </div>
  )
}
