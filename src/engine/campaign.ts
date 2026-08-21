import { getPuzzleBySeed } from './factory'
import { encodeSeed, hashString } from './seeds'
import type { Difficulty, Puzzle } from './types'

export const CAMPAIGN_LEVELS = 100

export interface CampaignMeta {
  level: number
  size: number
  difficulty: Difficulty
  label: string
}

/** Incremental ramp: warm-up 4×4 → classic 6×6 → tough 6×6 → expert 8×8 */
export function getCampaignMeta(level: number): CampaignMeta {
  const n = Math.max(1, Math.min(CAMPAIGN_LEVELS, level))

  if (n <= 15) {
    return {
      level: n,
      size: 4,
      difficulty: n <= 8 ? 'easy' : 'medium',
      label: n <= 8 ? 'Warm-up' : 'Getting started',
    }
  }
  if (n <= 40) {
    return {
      level: n,
      size: 6,
      difficulty: n <= 25 ? 'easy' : 'medium',
      label: n <= 25 ? 'Classic easy' : 'Classic medium',
    }
  }
  if (n <= 65) {
    return {
      level: n,
      size: 6,
      difficulty: n <= 52 ? 'hard' : 'expert',
      label: n <= 52 ? 'Deep classic' : 'Brutal classic',
    }
  }
  if (n <= 85) {
    return {
      level: n,
      size: 8,
      difficulty: n <= 75 ? 'hard' : 'expert',
      label: 'Challenge board',
    }
  }
  return {
    level: n,
    size: 8,
    difficulty: 'expert',
    label: 'Master board',
  }
}

export function campaignSeedCode(level: number): string {
  const meta = getCampaignMeta(level)
  const n = hashString(`tango-campaign-v1:${level}`)
  return encodeSeed(meta.size, meta.difficulty, n)
}

export function getCampaignPuzzle(level: number): Puzzle {
  return getPuzzleBySeed(campaignSeedCode(level))!
}
