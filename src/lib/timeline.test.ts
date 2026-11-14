import { describe, expect, it } from 'vitest'
import type { Config } from '../types'
import { buildTimeline, extendStep, stepIndexAt, totalOf } from './timeline'

function config(overrides: Partial<Config> = {}): Config {
  return {
    rounds: 2,
    readySecs: 10,
    phases: [
      { id: 'w', type: 'work', secs: 180 },
      { id: 'r', type: 'rest', secs: 60 },
    ],
    ...overrides,
  }
}

describe('buildTimeline', () => {
  it('inserts a get-ready step before every phase of every round', () => {
    const { steps, totalMs } = buildTimeline(config())

    expect(steps).toHaveLength(8)
    expect(totalMs).toBe((2 * 240 + 4 * 10) * 1000)

    expect(steps[0]).toMatchObject({
      type: 'ready',
      round: 1,
      startMs: 0,
      endMs: 10_000,
    })
    expect(steps[1]).toMatchObject({
      type: 'work',
      round: 1,
      startMs: 10_000,
      endMs: 190_000,
    })
    expect(steps[2]).toMatchObject({
      type: 'ready',
      round: 1,
      startMs: 190_000,
      endMs: 200_000,
    })
    expect(steps[3]).toMatchObject({
      type: 'rest',
      round: 1,
      startMs: 200_000,
      endMs: 260_000,
    })
    expect(steps[4]).toMatchObject({
      type: 'ready',
      round: 2,
      startMs: 260_000,
      endMs: 270_000,
    })
    expect(steps[7]).toMatchObject({
      type: 'rest',
      round: 2,
      startMs: 460_000,
      endMs: 520_000,
    })
  })

  it('omits the get-ready steps when readySecs is zero', () => {
    const { steps, totalMs } = buildTimeline(config({ readySecs: 0 }))
    expect(steps.map((step) => step.type)).toEqual([
      'work',
      'rest',
      'work',
      'rest',
    ])
    expect(totalMs).toBe(480_000)
  })

  it('handles an empty phase list', () => {
    expect(buildTimeline(config({ phases: [], rounds: 3 }))).toEqual({
      steps: [],
      totalMs: 0,
    })
  })

  it('keeps indexes contiguous', () => {
    const { steps } = buildTimeline(config())
    expect(steps.map((step) => step.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})

describe('stepIndexAt', () => {
  const { steps } = buildTimeline(config())

  it('treats boundaries as the start of the next step', () => {
    expect(stepIndexAt(steps, 0)).toBe(0)
    expect(stepIndexAt(steps, 9_999)).toBe(0)
    expect(stepIndexAt(steps, 10_000)).toBe(1)
    expect(stepIndexAt(steps, 189_999)).toBe(1)
    expect(stepIndexAt(steps, 190_000)).toBe(2)
    expect(stepIndexAt(steps, 200_000)).toBe(3)
  })

  it('clamps past the end and handles an empty timeline', () => {
    expect(stepIndexAt(steps, 999_999)).toBe(steps.length - 1)
    expect(stepIndexAt([], 0)).toBe(-1)
  })
})

describe('extendStep', () => {
  it('extends the current step and shifts every later step', () => {
    const { steps } = buildTimeline(config())
    const extended = extendStep(steps, 1, 30_000)

    expect(extended[1].endMs).toBe(220_000)
    expect(extended[2].startMs).toBe(220_000)
    expect(extended[2].endMs).toBe(230_000)
    expect(extended[1].startMs).toBe(10_000)
    expect(totalOf(extended)).toBe(550_000)
  })

  it('can extend a get-ready step', () => {
    const { steps } = buildTimeline(config())
    const extended = extendStep(steps, 0, 5_000)
    expect(extended[0].endMs).toBe(15_000)
    expect(extended[1].startMs).toBe(15_000)
    expect(totalOf(extended)).toBe(525_000)
  })
})
