import type {
  Config,
  EditablePhaseType,
  HistoryEntry,
  Phase,
  Settings,
} from '../types'
import { phaseColor } from '../phases'
import { PHASE_TYPES } from '../types'
import {
  MAX_PHASES,
  MAX_READY_SECS,
  MAX_ROUNDS,
  MAX_PHASE_SECS,
  MIN_PHASE_SECS,
  MIN_ROUNDS,
  clampInt,
} from './time'

const CONFIG_KEY = 'interval-timer.config.v1'
const SETTINGS_KEY = 'interval-timer.settings.v1'
const HISTORY_KEY = 'interval-timer.history.v1'
const MAX_HISTORY_ENTRIES = 5

export const DEFAULT_CONFIG: Config = {
  rounds: 4,
  readySecs: 5,
  phases: [
    { id: 'default-work', type: 'work', secs: 180 },
    { id: 'default-rest', type: 'rest', secs: 60 },
  ],
}

export const DEFAULT_SETTINGS: Settings = { sound: true, vibrate: true }

export function uid(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  return `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Reads the "get ready" duration. Older payloads used `prepSecs` for a single
 * count-in, so it is accepted as a fallback and reused for every phase.
 */
function readySecsOf(input: Record<string, unknown>): number {
  const source =
    input.readySecs ?? input.prepSecs ?? DEFAULT_CONFIG.readySecs
  return clampInt(Number(source), 0, MAX_READY_SECS)
}

function sanitizeColor(value: unknown, type: EditablePhaseType): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) return undefined
  if (trimmed.toLowerCase() === phaseColor(type).toLowerCase()) return undefined
  return trimmed
}

/**
 * Validates and clamps a config coming from storage or a shared URL.
 * Invalid phases are dropped; a config with no valid phases is still valid
 * (the UI disables Start instead).
 */
export function sanitizeConfig(input: unknown): Config | null {
  if (!isRecord(input)) return null
  if (!Array.isArray(input.phases)) return null

  const phases: Phase[] = []
  for (const raw of input.phases.slice(0, MAX_PHASES)) {
    if (!isRecord(raw)) continue
    const type = raw.type
    const secs = Number(raw.secs)
    if (typeof type !== 'string') continue
    if (!PHASE_TYPES.includes(type as EditablePhaseType)) continue
    if (!Number.isFinite(secs)) continue
    phases.push({
      id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : uid(),
      type: type as EditablePhaseType,
      secs: clampInt(secs, MIN_PHASE_SECS, MAX_PHASE_SECS),
      name: typeof raw.name === 'string' ? raw.name.trim().slice(0, 40) || undefined : undefined,
      color: sanitizeColor(raw.color, type as EditablePhaseType),
    })
  }

  return {
    rounds: clampInt(Number(input.rounds), MIN_ROUNDS, MAX_ROUNDS),
    readySecs: readySecsOf(input),
    phases,
  }
}

export function sanitizeSettings(input: unknown): Settings {
  if (!isRecord(input)) return { ...DEFAULT_SETTINGS }
  return {
    sound: input.sound !== false,
    vibrate: input.vibrate !== false,
  }
}

export function sanitizeHistory(input: unknown): HistoryEntry[] {
  if (!Array.isArray(input)) return []

  const entries: HistoryEntry[] = []
  for (const raw of input) {
    if (!isRecord(raw) || !Array.isArray(raw.phases)) continue

    const phases: HistoryEntry['phases'] = []
    for (const phase of raw.phases) {
      if (!isRecord(phase)) continue
      const type = phase.type
      const secs = Number(phase.secs)
      if (typeof type !== 'string') continue
      if (!PHASE_TYPES.includes(type as EditablePhaseType)) continue
      if (!Number.isFinite(secs)) continue
      phases.push({
        type: type as EditablePhaseType,
        secs: clampInt(secs, MIN_PHASE_SECS, MAX_PHASE_SECS),
        name: typeof phase.name === 'string' ? phase.name.trim().slice(0, 40) || undefined : undefined,
        color: sanitizeColor(phase.color, type as EditablePhaseType),
      })
    }
    if (phases.length === 0) continue

    entries.push({
      id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : uid(),
      at: Number.isFinite(Number(raw.at)) ? Number(raw.at) : Date.now(),
      rounds: clampInt(Number(raw.rounds), MIN_ROUNDS, MAX_ROUNDS),
      readySecs: readySecsOf(raw),
      totalSecs: Math.max(0, Math.round(Number(raw.totalSecs))) || 0,
      phases,
    })
  }

  return entries.slice(0, MAX_HISTORY_ENTRIES)
}

export function appendHistory(
  entries: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...entries].slice(0, MAX_HISTORY_ENTRIES)
}

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode; the app keeps working.
  }
}

export function loadConfig(): Config | null {
  const parsed = read(CONFIG_KEY)
  if (!isRecord(parsed) || parsed.v !== 1) return null
  return sanitizeConfig(parsed.data)
}

export function saveConfig(config: Config): void {
  write(CONFIG_KEY, { v: 1, data: config })
}

export function loadSettings(): Settings {
  const parsed = read(SETTINGS_KEY)
  if (!isRecord(parsed) || parsed.v !== 1) return { ...DEFAULT_SETTINGS }
  return sanitizeSettings(parsed.data)
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, { v: 1, data: settings })
}

export function loadHistory(): HistoryEntry[] {
  const parsed = read(HISTORY_KEY)
  if (!isRecord(parsed) || parsed.v !== 1) return []
  return sanitizeHistory(parsed.data)
}

export function saveHistory(entries: HistoryEntry[]): void {
  write(HISTORY_KEY, { v: 1, data: entries.slice(0, MAX_HISTORY_ENTRIES) })
}
