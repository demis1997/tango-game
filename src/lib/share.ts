import type { CellValue, Puzzle } from '../engine/types'
import { formatTime } from '../store/appData'

export function buildShareText(opts: {
  title: string
  timeMs: number
  hintsUsed: number
  mistakes: number
  streak?: number
  seed?: string
}): string {
  const lines = [
    opts.title,
    `${formatTime(opts.timeMs)} · ${opts.hintsUsed === 0 ? 'No hints' : `${opts.hintsUsed} hint${opts.hintsUsed === 1 ? '' : 's'}`}${opts.mistakes ? ` · ${opts.mistakes} mistake${opts.mistakes === 1 ? '' : 's'}` : ''}`,
  ]
  if (opts.streak && opts.streak > 0) {
    lines.push(`🔥 ${opts.streak}-day streak`)
  }
  if (opts.seed) {
    lines.push(`Seed ${opts.seed}`)
  }
  lines.push('tango-game')
  return lines.join('\n')
}

/** Non-spoiling grid sketch: filled vs empty only (no symbols). */
export function buildShareGridSketch(grid: CellValue[][]): string {
  return grid
    .map((row) => row.map((c) => (c === null ? '·' : '■')).join(''))
    .join('\n')
}

export async function shareOrCopy(text: string): Promise<'shared' | 'copied'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch {
      // fall through to clipboard
    }
  }
  await navigator.clipboard.writeText(text)
  return 'copied'
}

export function dailyShareTitle(dateKey: string): string {
  return `Tango Daily — ${dateKey}`
}

export function unlimitedShareTitle(puzzle: Puzzle): string {
  return `Tango Unlimited · ${puzzle.seed}`
}
