import type { Config, EditablePhaseType } from '../types'
import { sanitizeConfig, uid } from './storage'

interface SharePayload {
  v: 2
  r: number
  g: number
  f: Array<[string, number, string | null, string | null]>
}

function toBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padding =
    value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4))
  return atob(value.replace(/-/g, '+').replace(/_/g, '/') + padding)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function encodeShare(config: Config): string {
  const payload: SharePayload = {
    v: 2,
    r: config.rounds,
    g: config.readySecs,
    f: config.phases.map((phase) => [
      phase.type,
      phase.secs,
      phase.color ?? null,
      phase.name ?? null,
    ]),
  }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeShare(code: string): Config | null {
  try {
    const raw: unknown = JSON.parse(fromBase64Url(code))
    if (!isRecord(raw) || !Array.isArray(raw.f)) return null
    // v1 links stored the single count-in in `p`; treat it as a per-phase gap.
    if (raw.v !== 1 && raw.v !== 2) return null

    const phases: Array<{
      id: string
      type: EditablePhaseType
      secs: number
      color?: string
      name?: string
    }> = []

    for (const entry of raw.f) {
      if (!Array.isArray(entry) || entry.length < 2) continue
      const [type, secs, color, name] = entry
      if (typeof type !== 'string') continue
      phases.push({
        id: uid(),
        type: type as EditablePhaseType,
        secs: Number(secs),
        color: typeof color === 'string' ? color : undefined,
        name: typeof name === 'string' ? name : undefined,
      })
    }
    if (phases.length === 0) return null

    const config = sanitizeConfig({
      rounds: raw.r,
      readySecs: raw.v === 1 ? raw.p : raw.g,
      phases,
    })
    return config && config.phases.length > 0 ? config : null
  } catch {
    return null
  }
}

export function readShareHash(): Config | null {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#c=(.+)$/)
  return match ? decodeShare(match[1]) : null
}

export function clearShareHash(): void {
  if (typeof window === 'undefined') return
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  )
}
