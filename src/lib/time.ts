export const MIN_PHASE_SECS = 1
export const MAX_PHASE_SECS = 10800
export const MAX_PHASES = 24
export const MIN_ROUNDS = 1
export const MAX_ROUNDS = 50
export const MAX_READY_SECS = 60
export const STEP_SECS = 5

export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function clampSecs(secs: number): number {
  return clampInt(secs, MIN_PHASE_SECS, MAX_PHASE_SECS)
}

/** Formats whole seconds as m:ss, or h:mm:ss once the duration passes an hour. */
export function formatSecs(totalSecs: number): string {
  const secs = Math.max(0, Math.round(totalSecs))
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs % 3600) / 60)
  const seconds = secs % 60
  const paddedSeconds = String(seconds).padStart(2, '0')
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
  }
  return `${minutes}:${paddedSeconds}`
}

export function formatMs(ms: number): string {
  return formatSecs(Math.ceil(ms / 1000))
}

/**
 * Accepts plain seconds ("90") or clock notation ("1:30", "1:02:03").
 * Returns null when the input cannot be understood.
 */
export function parseDuration(raw: string): number | null {
  const value = raw.trim().toLowerCase().replace(/\s+/g, '')
  if (!value) return null
  if (/^\d+$/.test(value)) return Number(value)

  const parts = value.split(':')
  if (parts.length < 2 || parts.length > 3) return null
  if (!parts.every((part) => /^\d+$/.test(part))) return null

  return parts.reduce((acc, part) => acc * 60 + Number(part), 0)
}
