import { describe, expect, it } from 'vitest'
import { createRng } from './rng'
import {
  canPlace,
  cloneGrid,
  getViolations,
  isComplete,
} from './rules'
import { countSolutions, hasUniqueSolution } from './solver'
import { generateValidatedPuzzle } from './puzzle'
import { getDailyPuzzle, getPuzzleBySeed } from './factory'
import { campaignSeedCode, getCampaignPuzzle } from './campaign'
import { dailySeedCode, encodeSeed, parseSeed } from './seeds'
import { findHint } from './hints'
import { explainViolations } from './validator'

describe('rules', () => {
  it('rejects three in a row', () => {
    const grid = [
      [0, 0, null, 1],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ] as const
    expect(canPlace(cloneGrid(grid as never), 0, 2, 0, [])).toBe(false)
    expect(canPlace(cloneGrid(grid as never), 0, 2, 1, [])).toBe(true)
  })

  it('flags constraint violations', () => {
    const grid = [
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
    ]
    const cons = [{ r1: 0, c1: 0, r2: 0, c2: 1, type: 'eq' as const }]
    expect(getViolations(grid, cons).length).toBeGreaterThan(0)
  })
})

describe('seeds', () => {
  it('round-trips encode/parse', () => {
    const code = encodeSeed(6, 'hard', 123456)
    const parsed = parseSeed(code)
    expect(parsed).toEqual({ size: 6, difficulty: 'hard', n: 123456 })
  })

  it('daily seed is deterministic', () => {
    expect(dailySeedCode('2026-08-22')).toBe(dailySeedCode('2026-08-22'))
    expect(dailySeedCode('2026-08-22')).not.toBe(dailySeedCode('2026-08-21'))
  })
})

describe('generation', () => {
  it('produces unique solvable daily puzzles', () => {
    const p = getDailyPuzzle('2026-08-22')
    expect(hasUniqueSolution(p.grid, p.constraints)).toBe(true)
    expect(isComplete(p.solution, p.constraints)).toBe(true)
    expect(countSolutions(p.grid, p.constraints, 2)).toBe(1)
  })

  it('reproduces the same puzzle from a seed', () => {
    const a = getPuzzleBySeed('6MCH1FX')
    const b = getPuzzleBySeed('6MCH1FX')
    expect(a).not.toBeNull()
    expect(JSON.stringify(a!.grid)).toBe(JSON.stringify(b!.grid))
    expect(JSON.stringify(a!.solution)).toBe(JSON.stringify(b!.solution))
  })

  it('generates 100 unique puzzles across difficulties', () => {
    const diffs = ['easy', 'medium', 'hard', 'expert'] as const
    for (let i = 0; i < 100; i++) {
      const d = diffs[i % diffs.length]!
      const p = generateValidatedPuzzle(6, d, 1000 + i * 97, encodeSeed(6, d, 1000 + i * 97))
      expect(hasUniqueSolution(p.grid, p.constraints)).toBe(true)
      expect(isComplete(p.grid, p.constraints)).toBe(false)
    }
  }, 60_000)

  it('campaign levels are deterministic and unique', () => {
    const a = getCampaignPuzzle(1)
    const b = getPuzzleBySeed(campaignSeedCode(1))
    expect(JSON.stringify(a.grid)).toBe(JSON.stringify(b!.grid))
    expect(hasUniqueSolution(a.grid, a.constraints)).toBe(true)
  })
})

describe('hints', () => {
  it('returns a reason for a forced cell', () => {
    const p = getDailyPuzzle('2026-08-22')
    const hint = findHint(p.grid, p.constraints, p.solution)
    expect(hint).not.toBeNull()
    expect(hint!.reason.toLowerCase()).not.toBe(
      `this cell is a ${hint!.value === 0 ? 'sun' : 'moon'}.`,
    )
    expect(hint!.reason.length).toBeGreaterThan(20)
  })
})

describe('validator', () => {
  it('explains triples', () => {
    const grid = [
      [0, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 0],
    ]
    const explained = explainViolations(grid, [])
    expect(explained.some((e: { kind: string }) => e.kind === 'triple')).toBe(true)
  })
})

describe('rng', () => {
  it('is deterministic', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect(a.next()).toBe(b.next())
    expect(a.int(10)).toBe(b.int(10))
  })
})
