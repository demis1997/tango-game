import { useState } from 'react'
import { useApp } from '../store/AppContext'
import './Tutorial.css'

const STEPS = [
  {
    title: 'Place symbols',
    body: 'Tap a cell to cycle Empty → Sun → Moon. Right-click or long-press to cycle the other way.',
  },
  {
    title: 'Balance',
    body: 'Every row and column needs an equal number of Suns and Moons.',
  },
  {
    title: 'No triples',
    body: 'Never place three identical symbols next to each other in a row or column.',
  },
  {
    title: 'Constraints',
    body: '= means those neighbors must match. × means they must differ.',
  },
  {
    title: 'Deduce, don’t guess',
    body: 'Every puzzle has one solution. Use Hint when stuck — it explains a forced move before filling it.',
  },
]

export function TutorialOverlay() {
  const { data, setSettings } = useApp()
  const [step, setStep] = useState(0)

  if (data.settings.tutorialDone) return null

  const last = step >= STEPS.length - 1
  const current = STEPS[step]!

  return (
    <div className="tutorial-overlay" role="dialog" aria-label="How to play tutorial">
      <div className="tutorial-card">
        <p className="tutorial-step">
          {step + 1} / {STEPS.length}
        </p>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="tutorial-actions">
          {!last ? (
            <button
              type="button"
              className="link-btn primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="link-btn primary"
              onClick={() => setSettings({ tutorialDone: true })}
            >
              Start playing
            </button>
          )}
          <button
            type="button"
            className="link-btn"
            onClick={() => setSettings({ tutorialDone: true })}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
