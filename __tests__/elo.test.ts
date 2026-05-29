import { describe, it, expect } from 'vitest'
import { calculateExpectedScore, calculateNewElo } from '@/lib/elo'

describe('calculateExpectedScore', () => {
  it('returns 0.5 when players have same ELO', () => {
    expect(calculateExpectedScore(1000, 1000)).toBeCloseTo(0.5)
  })
  it('returns > 0.5 when player has higher ELO', () => {
    expect(calculateExpectedScore(1200, 1000)).toBeGreaterThan(0.5)
  })
  it('returns < 0.5 when player has lower ELO', () => {
    expect(calculateExpectedScore(800, 1000)).toBeLessThan(0.5)
  })
})

describe('calculateNewElo', () => {
  it('increases ELO on win', () => {
    const newElo = calculateNewElo(1000, 1000, 1, 10)
    expect(newElo).toBeGreaterThan(1000)
  })
  it('decreases ELO on loss', () => {
    const newElo = calculateNewElo(1000, 1000, 0, 10)
    expect(newElo).toBeLessThan(1000)
  })
  it('uses K=32 for new players (< 30 games)', () => {
    const win = calculateNewElo(1000, 1000, 1, 10)
    expect(win).toBe(1016) // 1000 + 32 * 0.5
  })
  it('uses K=16 for established players (>= 30 games)', () => {
    const win = calculateNewElo(1000, 1000, 1, 30)
    expect(win).toBe(1008) // 1000 + 16 * 0.5
  })
})
