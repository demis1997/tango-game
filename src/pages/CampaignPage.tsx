import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GamePlay } from '../components/GamePlay'
import {
  CAMPAIGN_LEVELS,
  getCampaignMeta,
  getCampaignPuzzle,
} from '../engine/campaign'
import { difficultyLabel } from '../engine/seeds'
import { ACHIEVEMENTS } from '../data/achievements'
import { useApp } from '../store/AppContext'
import { formatTime } from '../store/appData'
import './CampaignPage.css'

export function CampaignPage() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const { data } = useApp()
  const [toast, setToast] = useState<string[] | null>(null)

  if (!levelId) {
    return <CampaignMap />
  }

  const level = Number(levelId)
  if (!Number.isInteger(level) || level < 1 || level > CAMPAIGN_LEVELS) {
    navigate(`/campaign/${data.campaignUnlocked}`, { replace: true })
    return null
  }

  if (level > data.campaignUnlocked) {
    return (
      <div className="campaign-locked page">
        <h1>Level {level} locked</h1>
        <p>Clear level {data.campaignUnlocked} first.</p>
        <Link className="link-btn primary" to={`/campaign/${data.campaignUnlocked}`}>
          Continue
        </Link>
      </div>
    )
  }

  return (
    <CampaignPlay
      level={level}
      onToast={setToast}
      toast={toast}
    />
  )
}

function CampaignMap() {
  const { data } = useApp()
  return (
    <div className="campaign-map page">
      <header className="page-head">
        <h1>Campaign</h1>
        <p className="lede">
          100 levels, easy → expert. Next:{' '}
          <Link to={`/campaign/${data.campaignUnlocked}`}>
            Level {data.campaignUnlocked}
          </Link>
        </p>
      </header>
      <div className="camp-grid">
        {Array.from({ length: CAMPAIGN_LEVELS }, (_, i) => {
          const level = i + 1
          const meta = getCampaignMeta(level)
          const locked = level > data.campaignUnlocked
          const rec = data.campaignRecords[String(level)]
          return (
            <Link
              key={level}
              to={locked ? '#' : `/campaign/${level}`}
              onClick={(e) => locked && e.preventDefault()}
              className={`camp-tile ${locked ? 'locked' : ''} ${rec ? 'cleared' : ''} ${level === data.campaignUnlocked ? 'current' : ''}`}
              title={`${difficultyLabel(meta.difficulty)} · ${meta.size}×${meta.size}`}
            >
              <span className="num">{level}</span>
              {rec && (
                <span className="time">{formatTime(rec.bestTimeMs)}</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function CampaignPlay({
  level,
  toast,
  onToast,
}: {
  level: number
  toast: string[] | null
  onToast: (v: string[] | null) => void
}) {
  const navigate = useNavigate()
  const { data, saveCampaignSession, completeCampaign } = useApp()
  const puzzle = useMemo(() => getCampaignPuzzle(level), [level])
  const meta = getCampaignMeta(level)
  const best = data.campaignRecords[String(level)]?.bestTimeMs

  return (
    <div className="campaign-play">
      <div className="camp-toolbar">
        <Link to="/campaign" className="back-link">
          ← All levels
        </Link>
        {best != null && (
          <span className="best">Best {formatTime(best)}</span>
        )}
      </div>
      <GamePlay
        key={puzzle.seed}
        puzzle={puzzle}
        eyebrow="Campaign"
        heading={`Level ${level}`}
        subheading={`${meta.label} · ${difficultyLabel(meta.difficulty)} · ${meta.size}×${meta.size}`}
        initialSession={data.campaignSessions[String(level)]}
        onSessionChange={(s) => saveCampaignSession(level, s)}
        onComplete={({ timeMs, hintsUsed }) => {
          const newly = completeCampaign(level, timeMs, hintsUsed)
          if (newly.length) {
            onToast(
              newly.map(
                (id) => ACHIEVEMENTS.find((a) => a.id === id)?.title ?? id,
              ),
            )
          }
        }}
        actions={
          <>
            {level < CAMPAIGN_LEVELS && (
              <button
                type="button"
                className="link-btn primary"
                onClick={() => {
                  onToast(null)
                  navigate(`/campaign/${level + 1}`)
                }}
              >
                Level {level + 1}
              </button>
            )}
            <Link className="link-btn" to="/campaign">
              Level map
            </Link>
            <Link className="link-btn" to="/achievements">
              Achievements
            </Link>
          </>
        }
      />
      {toast && (
        <div className="toast-ach">
          <strong>Achievement unlocked</strong>
          <ul>
            {toast.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button type="button" className="ctrl" onClick={() => onToast(null)}>
            Nice
          </button>
        </div>
      )}
    </div>
  )
}
