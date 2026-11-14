import { describe, expect, it } from 'vitest'
import { clampInt, formatSecs, parseDuration } from './time'

describe('formatSecs', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [600, '10:00'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('formats %i as %s', (input, expected) => {
    expect(formatSecs(input)).toBe(expected)
  })
})

describe('parseDuration', () => {
  it.each([
    ['90', 90],
    [' 90 ', 90],
    ['1:30', 90],
    ['0:05', 5],
    ['1:02:03', 3723],
  ])('parses %s', (input, expected) => {
    expect(parseDuration(input)).toBe(expected)
  })

  it.each(['', 'abc', '1:', ':30', '1:2:3:4', '-10', '1.5'])(
    'rejects %s',
    (input) => {
      expect(parseDuration(input)).toBeNull()
    },
  )
})

describe('clampInt', () => {
  it('rounds and clamps', () => {
    expect(clampInt(3.6, 1, 50)).toBe(4)
    expect(clampInt(999, 1, 50)).toBe(50)
    expect(clampInt(-5, 0, 300)).toBe(0)
  })

  it('falls back to the minimum for non-finite input', () => {
    expect(clampInt(Number.NaN, 7, 10)).toBe(7)
    expect(clampInt(Number.POSITIVE_INFINITY, 1, 10)).toBe(1)
  })
})
