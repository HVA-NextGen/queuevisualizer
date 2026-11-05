import { describe, expect, it } from 'vitest'
import { demo, formatSampleTime, validateDemo } from './demo'
import { getCongestion, getOccupancy } from '../lib/congestion'

describe('fictional congestion rules', () => {
  it.each([
    [0, 'low'], [39.999, 'low'], [40, 'moderate'],
    [74.999, 'moderate'], [75, 'high'], [100, 'high'], [120, 'high'],
  ])('classifies %s percent as %s', (occupancy, key) => {
    expect(getCongestion(occupancy).key).toBe(key)
  })
  it.each([NaN, Infinity, -1])('rejects invalid occupancy %s', value => {
    expect(() => getCongestion(value)).toThrow()
  })
  it('calculates the current sample without rounding across thresholds', () => {
    expect(getOccupancy(42, 60)).toBe(70)
    expect(getCongestion(getOccupancy(42, 60)).label).toBe('Kohtalaista ruuhkaa')
    expect(getOccupancy(0, 60)).toBe(0)
  })
  it.each([[-1, 60], [1.5, 60], [42, 0], [42, -1], [42, Infinity]])('rejects invalid counts %s/%s', (total, capacity) => {
    expect(() => getOccupancy(total, capacity)).toThrow()
  })
})

describe('fixed demo fixture', () => {
  it('has 24 ordered hourly points ending at the current scenario', () => {
    expect(() => validateDemo(demo)).not.toThrow()
    expect(demo.history).toHaveLength(24)
    expect(demo.history.at(-1)).toEqual({ timestamp: demo.timestamp, occupancy: 70 })
    expect(demo.urgent).toBeLessThanOrEqual(demo.total)
  })
  it('formats a fixed timestamp in Finnish Helsinki time', () => {
    const formatted = formatSampleTime(demo.timestamp)
    expect(formatted).toContain('5.11.2026')
    expect(formatted).toContain('20.00')
    expect(() => formatSampleTime('invalid')).toThrow()
  })
  it('rejects inconsistent demo data explicitly', () => {
    expect(() => validateDemo({ ...demo, urgent: 43 })).toThrow()
    expect(() => validateDemo({ ...demo, history: [] })).toThrow()
    expect(() => validateDemo({ ...demo, timestamp: 'invalid' })).toThrow()
    expect(() => validateDemo({ ...demo, history: demo.history.toReversed() })).toThrow()
    expect(() => validateDemo({ ...demo, total: 41 })).toThrow()
  })
})
