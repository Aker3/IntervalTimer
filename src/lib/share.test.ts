import { describe, expect, it } from 'vitest'
import type { Config } from '../types'
import { decodeShare, encodeShare } from './share'

const config: Config = {
  rounds: 3,
  readySecs: 5,
  phases: [
    { id: 'a', type: 'hot', secs: 180 },
    { id: 'b', type: 'swap', secs: 10 },
    { id: 'c', type: 'cold', secs: 60 },
  ],
}

function encodeV1(payload: unknown): string {
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

describe('share links', () => {
  it('round-trips a config', () => {
    const decoded = decodeShare(encodeShare(config))
    expect(decoded).not.toBeNull()
    expect(decoded?.rounds).toBe(3)
    expect(decoded?.readySecs).toBe(5)
    expect(decoded?.phases.map((phase) => [phase.type, phase.secs])).toEqual([
      ['hot', 180],
      ['swap', 10],
      ['cold', 60],
    ])
  })

  it('produces url-safe output', () => {
    expect(encodeShare(config)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('reads v1 links that used a single count-in', () => {
    const v1 = encodeV1({ v: 1, r: 2, p: 8, f: [['work', 60]] })
    const decoded = decodeShare(v1)
    expect(decoded?.rounds).toBe(2)
    expect(decoded?.readySecs).toBe(8)
  })

  it('rejects garbage, empty configs and unknown versions', () => {
    expect(decodeShare('not-a-link')).toBeNull()
    expect(decodeShare('')).toBeNull()
    expect(decodeShare(encodeShare({ ...config, phases: [] }))).toBeNull()

    const wrongVersion = encodeV1({ v: 3, r: 1, g: 0, f: [] })
    expect(decodeShare(wrongVersion)).toBeNull()
  })
})
