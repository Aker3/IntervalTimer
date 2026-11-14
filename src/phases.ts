import type { EditablePhaseType, PhaseType } from './types'

export const PHASE_META: Record<
  PhaseType,
  { label: string; color: string; hint: string }
> = {
  ready: {
    label: 'Get ready',
    color: '#94a3b8',
    hint: 'Pause before every phase',
  },
  work: {
    label: 'Work',
    color: '#fb923c',
    hint: 'Effort interval',
  },
  rest: {
    label: 'Rest',
    color: '#60a5fa',
    hint: 'Recovery interval',
  },
  hot: {
    label: 'Hot',
    color: '#fb7185',
    hint: 'Heat exposure',
  },
  cold: {
    label: 'Cold',
    color: '#22d3ee',
    hint: 'Cold exposure',
  },
  swap: {
    label: 'Change',
    color: '#a78bfa',
    hint: 'Transition between stations',
  },
}

export function phaseLabel(input: PhaseType | { type: EditablePhaseType; name?: string }): string {
  if (typeof input === 'string') return PHASE_META[input].label
  return (input.name && input.name.trim()) || PHASE_META[input.type].label
}

export function phaseColor(input: PhaseType | { type: EditablePhaseType; color?: string }): string {
  if (typeof input === 'string') return PHASE_META[input].color
  return (input.color && input.color.trim()) || PHASE_META[input.type].color
}
