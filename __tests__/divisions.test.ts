import { describe, it, expect } from 'vitest'
import { getDivisionFromElo, getDivisionName, getDivisionColor, DIVISIONS } from '@/lib/divisions'

describe('getDivisionFromElo', () => {
  it('returns 1 for ELO 0', () => expect(getDivisionFromElo(0)).toBe(1))
  it('returns 1 for ELO 799', () => expect(getDivisionFromElo(799)).toBe(1))
  it('returns 2 for ELO 800', () => expect(getDivisionFromElo(800)).toBe(2))
  it('returns 3 for ELO 1000 (default)', () => expect(getDivisionFromElo(1000)).toBe(3))
  it('returns 3 for ELO 1199', () => expect(getDivisionFromElo(1199)).toBe(3))
  it('returns 7 for ELO 1800', () => expect(getDivisionFromElo(1800)).toBe(7))
  it('returns 7 for ELO 9999', () => expect(getDivisionFromElo(9999)).toBe(7))
})

describe('getDivisionName', () => {
  it('returns Principiante for div 1', () => expect(getDivisionName(1)).toBe('Principiante'))
  it('returns Pro for div 7', () => expect(getDivisionName(7)).toBe('Pro'))
  it('returns Intermedio for div 3', () => expect(getDivisionName(3)).toBe('Intermedio'))
})

describe('getDivisionColor', () => {
  it('returns a string for every division 1-7', () => {
    for (let i = 1; i <= 7; i++) {
      expect(typeof getDivisionColor(i)).toBe('string')
    }
  })
})
