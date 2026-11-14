export const PHASE_TYPES = ['work', 'rest', 'hot', 'cold', 'swap'] as const

export type EditablePhaseType = (typeof PHASE_TYPES)[number]
export type PhaseType = EditablePhaseType | 'ready'

export interface Phase {
  id: string
  type: EditablePhaseType
  secs: number
  /** Optional custom label shown instead of the type label. */
  name?: string
  /** Optional color (hex). Defaults to the type color. */
  color?: string
}

export interface Config {
  rounds: number
  /** "Get ready" gap inserted before every phase, in seconds. */
  readySecs: number
  phases: Phase[]
}

export interface Settings {
  sound: boolean
  vibrate: boolean
}

export interface Step {
  index: number
  type: PhaseType
  /** 1-based round for phase and get-ready steps. */
  round: number
  startMs: number
  endMs: number
  /** Resolved display label (custom name or type label). */
  label: string
  /** Resolved color (hex) for this step. */
  color: string
}

export interface HistoryEntry {
  id: string
  at: number
  rounds: number
  readySecs: number
  totalSecs: number
  phases: Array<{ type: EditablePhaseType; secs: number; color?: string; name?: string }>
}

export type SessionStatus = 'idle' | 'running' | 'paused' | 'done'
