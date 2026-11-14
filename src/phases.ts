import type { PhaseType } from './types'

export const PHASE_META: Record<
  PhaseType,
  { label: string; color: string; hint: string }
> = {
  ready: {
    label: 'Get ready',
    color: '#8e918d',
    hint: 'Pause before every phase',
  },
  work: {
    label: 'Work',
    color: '#c2a15b',
    hint: 'Effort interval',
  },
  rest: {
    label: 'Rest',
    color: '#7c8b85',
    hint: 'Recovery interval',
  },
  hot: {
    label: 'Hot',
    color: '#c07a5e',
    hint: 'Heat exposure',
  },
  cold: {
    label: 'Cold',
    color: '#6e8fa3',
    hint: 'Cold exposure',
  },
  swap: {
    label: 'Change',
    color: '#9a8fa8',
    hint: 'Transition between stations',
  },
}

export function phaseLabel(type: PhaseType): string {
  return PHASE_META[type].label
}

export function phaseColor(type: PhaseType): string {
  return PHASE_META[type].color
}
