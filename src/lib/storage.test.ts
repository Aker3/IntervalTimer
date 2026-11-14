import { describe, expect, it } from 'vitest'
import type { HistoryEntry } from '../types'
import {
  appendHistory,
  sanitizeConfig,
  sanitizeHistory,
  sanitizeSettings,
} from './storage'

describe('sanitizeConfig', () => {
  it('rejects values that are not config objects', () => {
    expect(sanitizeConfig(null)).toBeNull()
    expect(sanitizeConfig('nope')).toBeNull()
    expect(sanitizeConfig({})).toBeNull()
    expect(sanitizeConfig({ phases: 'nope' })).toBeNull()
  })

  it('clamps numeric values into range', () => {
    const config = sanitizeConfig({
      rounds: 999,
      readySecs: 999,
      phases: [{ type: 'work', secs: 0 }],
    })

    expect(config).not.toBeNull()
    expect(config?.rounds).toBe(50)
    expect(config?.readySecs).toBe(60)
    expect(config?.phases[0].secs).toBe(1)

    const low = sanitizeConfig({
      rounds: -4,
      readySecs: -10,
      phases: [{ type: 'work', secs: 99_999 }],
    })
    expect(low?.rounds).toBe(1)
    expect(low?.readySecs).toBe(0)
    expect(low?.phases[0].secs).toBe(3599)
  })

  it('defaults the get-ready gap when the field is missing', () => {
    const config = sanitizeConfig({
      rounds: 1,
      phases: [{ type: 'work', secs: 30 }],
    })
    expect(config?.readySecs).toBe(5)
  })

  it('accepts the legacy prepSecs field as the get-ready gap', () => {
    const config = sanitizeConfig({
      rounds: 1,
      prepSecs: 20,
      phases: [{ type: 'work', secs: 30 }],
    })
    expect(config?.readySecs).toBe(20)
  })

  it('drops unknown phase types and keeps the valid ones', () => {
    const config = sanitizeConfig({
      rounds: 2,
      readySecs: 5,
      phases: [
        { type: 'banana', secs: 30 },
        { type: 'cold', secs: 60 },
        { type: 'swap', secs: 10 },
      ],
    })

    expect(config?.phases.map((phase) => phase.type)).toEqual(['cold', 'swap'])
  })

  it('accepts a config with no phases', () => {
    const config = sanitizeConfig({ rounds: 3, readySecs: 5, phases: [] })
    expect(config).toEqual({ rounds: 3, readySecs: 5, phases: [] })
  })

  it('generates ids when they are missing', () => {
    const config = sanitizeConfig({
      rounds: 1,
      readySecs: 0,
      phases: [{ type: 'work', secs: 30 }],
    })
    expect(config?.phases[0].id).toBeTruthy()
  })
})

describe('sanitizeSettings', () => {
  it('defaults to everything enabled', () => {
    expect(sanitizeSettings(null)).toEqual({ sound: true, vibrate: true })
    expect(sanitizeSettings({})).toEqual({ sound: true, vibrate: true })
  })

  it('keeps explicit opt-outs', () => {
    expect(sanitizeSettings({ sound: false })).toEqual({
      sound: false,
      vibrate: true,
    })
  })
})

describe('sanitizeHistory', () => {
  const entry = {
    id: 'a',
    at: 1_700_000_000_000,
    rounds: 3,
    readySecs: 5,
    totalSecs: 750,
    phases: [{ type: 'hot', secs: 180 }],
  }

  it('drops entries without valid phases', () => {
    expect(
      sanitizeHistory([{ ...entry, phases: [{ type: 'nope', secs: 10 }] }]),
    ).toEqual([])
  })

  it('keeps at most five entries', () => {
    const many = Array.from({ length: 8 }, (_, index) => ({
      ...entry,
      id: String(index),
    }))
    expect(sanitizeHistory(many)).toHaveLength(5)
  })

  it('falls back to prepSecs for old entries', () => {
    const { readySecs: _, ...legacy } = entry
    const parsed = sanitizeHistory([{ ...legacy, prepSecs: 15 }])
    expect(parsed[0].readySecs).toBe(15)
  })

  it('keeps long sessions intact', () => {
    const parsed = sanitizeHistory([{ ...entry, totalSecs: 200_000 }])
    expect(parsed[0].totalSecs).toBe(200_000)
  })
})

describe('appendHistory', () => {
  it('prepends and truncates to five entries', () => {
    const existing = Array.from({ length: 5 }, (_, index) => ({
      id: String(index),
    })) as HistoryEntry[]
    const next = appendHistory(existing, { id: 'new' } as HistoryEntry)
    expect(next).toHaveLength(5)
    expect(next[0].id).toBe('new')
  })
})
