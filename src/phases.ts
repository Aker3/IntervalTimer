import type { PhaseType } from './types'

export const PHASE_META: Record<
  PhaseType,
  { label: string; color: string; hint: string }
> = {
  ready: {
    label: 'Get ready',
    color: 'var(--color-ready)',
    hint: 'Pause before every phase',
  },
  work: {
    label: 'Work',
    color: 'var(--color-work)',
    hint: 'Effort interval',
  },
  rest: {
    label: 'Rest',
    color: 'var(--color-rest)',
    hint: 'Recovery interval',
  },
  hot: {
    label: 'Hot',
    color: 'var(--color-hot)',
    hint: 'Heat exposure',
  },
  cold: {
    label: 'Cold',
    color: 'var(--color-cold)',
    hint: 'Cold exposure',
  },
  swap: {
    label: 'Change',
    color: 'var(--color-swap)',
    hint: 'Transition between stations',
  },
}

export function phaseLabel(type: PhaseType): string {
  return PHASE_META[type].label
}

export function phaseColor(type: PhaseType): string {
  return PHASE_META[type].color
}
