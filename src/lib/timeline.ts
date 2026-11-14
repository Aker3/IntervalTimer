import type { Config, Step } from '../types'
import { phaseColor, phaseLabel } from '../phases'

export interface Timeline {
  steps: Step[]
  totalMs: number
}

/**
 * Expands a config into an absolute timeline. Every phase (in every round) is
 * preceded by a "get ready" step when `readySecs` is greater than zero.
 */
export function buildTimeline(config: Config): Timeline {
  const steps: Step[] = []
  let cursor = 0

  for (let round = 1; round <= config.rounds; round++) {
    for (const phase of config.phases) {
      if (config.readySecs > 0) {
        const readyEnd = cursor + config.readySecs * 1000
        steps.push({
          index: steps.length,
          type: 'ready',
          round,
          startMs: cursor,
          endMs: readyEnd,
          label: phaseLabel('ready'),
          color: phaseColor('ready'),
        })
        cursor = readyEnd
      }

      const duration = phase.secs * 1000
      steps.push({
        index: steps.length,
        type: phase.type,
        round,
        startMs: cursor,
        endMs: cursor + duration,
        label: phaseLabel(phase),
        color: phaseColor(phase),
      })
      cursor += duration
    }
  }

  return { steps, totalMs: cursor }
}

/** Index of the step containing `elapsedMs` (boundaries belong to the next step). */
export function stepIndexAt(steps: Step[], elapsedMs: number): number {
  if (steps.length === 0) return -1
  if (elapsedMs <= 0) return 0
  for (let index = 0; index < steps.length; index++) {
    if (elapsedMs < steps[index].endMs) return index
  }
  return steps.length - 1
}

/** Extends one step and shifts every later step by the same amount. */
export function extendStep(steps: Step[], index: number, deltaMs: number): Step[] {
  return steps.map((step, position) => {
    if (position < index) return step
    if (position === index) return { ...step, endMs: step.endMs + deltaMs }
    return {
      ...step,
      startMs: step.startMs + deltaMs,
      endMs: step.endMs + deltaMs,
    }
  })
}

export function totalOf(steps: Step[]): number {
  return steps.length === 0 ? 0 : steps[steps.length - 1].endMs
}
