import { createSignal, onCleanup } from 'solid-js'
import type { Config, SessionStatus, Settings, Step } from '../types'
import { audio, unlockAudio } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { buildTimeline, extendStep, stepIndexAt } from '../lib/timeline'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakelock'

export interface SessionApi {
  status: () => SessionStatus
  steps: () => Step[]
  totalMs: () => number
  elapsedMs: () => number
  index: () => number
  step: () => Step | null
  next: () => Step | null
  remainingMs: () => number
  progress: () => number
  appliedConfig: () => Config | null
  start: (config: Config) => void
  pause: () => void
  resume: () => void
  skip: () => void
  addTime: (ms: number) => void
  stop: () => void
  sync: () => void
}

interface SessionOptions {
  getSettings: () => Settings
  onComplete: (config: Config, totalMs: number) => void
}

function cloneConfig(config: Config): Config {
  return {
    rounds: config.rounds,
    readySecs: config.readySecs,
    phases: config.phases.map((phase) => ({ ...phase })),
  }
}

export function createSession(options: SessionOptions): SessionApi {
  const [status, setStatus] = createSignal<SessionStatus>('idle')
  const [steps, setSteps] = createSignal<Step[]>([])
  const [totalMs, setTotalMs] = createSignal(0)
  const [elapsedMs, setElapsedMs] = createSignal(0)
  const [index, setIndex] = createSignal(0)

  let applied: Config | null = null
  let data: Step[] = []
  let total = 0
  let base = 0
  let runStart = 0
  let frame = 0
  let interval = 0
  let lastIndex = -1
  let lastCount = -1
  let finished = false

  const step = (): Step | null => steps()[index()] ?? null
  const next = (): Step | null => steps()[index() + 1] ?? null

  const remainingMs = (): number => Math.max(0, (step()?.endMs ?? 0) - elapsedMs())

  const progress = (): number => {
    const current = step()
    if (!current) return 0
    const span = current.endMs - current.startMs
    if (span <= 0) return 1
    return Math.min(1, Math.max(0, (elapsedMs() - current.startMs) / span))
  }

  const stopLoops = (): void => {
    if (frame) cancelAnimationFrame(frame)
    if (interval) window.clearInterval(interval)
    frame = 0
    interval = 0
  }

  const updateCues = (elapsed: number): void => {
    const currentIndex = stepIndexAt(data, elapsed)
    if (currentIndex < 0) return

    if (currentIndex !== lastIndex) {
      lastIndex = currentIndex
      lastCount = -1
      setIndex(currentIndex)
      const current = data[currentIndex]
      if (options.getSettings().sound) audio.phase(current.type)
      if (options.getSettings().vibrate) haptic.phase()
    }

    const current = data[currentIndex]
    if (!current) return

    const span = current.endMs - current.startMs
    if (span < 5000) {
      lastCount = -1
      return
    }

    const secondsLeft = Math.ceil((current.endMs - elapsed) / 1000)
    if (secondsLeft >= 1 && secondsLeft <= 3) {
      if (secondsLeft !== lastCount) {
        lastCount = secondsLeft
        if (options.getSettings().sound) audio.tick()
        if (options.getSettings().vibrate) haptic.tick()
      }
    } else {
      lastCount = -1
    }
  }

  const finish = (): void => {
    if (finished) return
    finished = true
    stopLoops()
    releaseWakeLock()
    setElapsedMs(total)
    setIndex(Math.max(0, data.length - 1))
    setStatus('done')
    if (options.getSettings().sound) audio.end()
    if (options.getSettings().vibrate) haptic.end()
    if (applied) options.onComplete(applied, total)
  }

  const sample = (): void => {
    if (status() !== 'running') return
    const elapsed = base + (Date.now() - runStart)
    if (elapsed >= total) {
      finish()
      return
    }
    setElapsedMs(elapsed)
    updateCues(elapsed)
  }

  const frameLoop = (): void => {
    if (status() !== 'running') return
    sample()
    if (status() === 'running') frame = requestAnimationFrame(frameLoop)
  }

  const startLoops = (): void => {
    stopLoops()
    frame = requestAnimationFrame(frameLoop)
    interval = window.setInterval(sample, 250)
  }

  const start = (config: Config): void => {
    const built = buildTimeline(config)
    if (built.steps.length === 0 || built.totalMs <= 0) return

    applied = cloneConfig(config)
    data = built.steps
    total = built.totalMs
    base = 0
    runStart = Date.now()
    lastIndex = -1
    lastCount = -1
    finished = false

    setSteps(built.steps)
    setTotalMs(total)
    setElapsedMs(0)
    setIndex(0)
    setStatus('running')

    unlockAudio()
    void acquireWakeLock()
    startLoops()
    sample()
  }

  const pause = (): void => {
    if (status() !== 'running') return
    base += Date.now() - runStart
    setElapsedMs(base)
    setStatus('paused')
    stopLoops()
    if (options.getSettings().sound) audio.pause()
    if (options.getSettings().vibrate) haptic.pause()
  }

  const resume = (): void => {
    if (status() !== 'paused') return
    runStart = Date.now()
    setStatus('running')
    unlockAudio()
    void acquireWakeLock()
    startLoops()
  }

  const skip = (): void => {
    const current = step()
    if (!current) return
    if (current.endMs >= total) {
      finish()
      return
    }

    base = current.endMs
    setElapsedMs(base)

    if (status() === 'paused') {
      setIndex(stepIndexAt(data, base))
      return
    }
    if (status() !== 'running') return

    runStart = Date.now()
    sample()
  }

  const addTime = (ms: number): void => {
    if (status() !== 'running' && status() !== 'paused') return
    const currentIndex = index()
    if (!data[currentIndex]) return

    data = extendStep(data, currentIndex, ms)
    total = data.length > 0 ? data[data.length - 1].endMs : total
    lastCount = -1

    setSteps(data)
    setTotalMs(total)
    if (status() === 'running') sample()
  }

  const stop = (): void => {
    stopLoops()
    releaseWakeLock()
    applied = null
    data = []
    total = 0
    base = 0
    lastIndex = -1
    lastCount = -1
    finished = false
    setSteps([])
    setTotalMs(0)
    setElapsedMs(0)
    setIndex(0)
    setStatus('idle')
  }

  const sync = (): void => {
    if (status() === 'running') sample()
  }

  onCleanup(() => {
    stopLoops()
    releaseWakeLock()
  })

  return {
    status,
    steps,
    totalMs,
    elapsedMs,
    index,
    step,
    next,
    remainingMs,
    progress,
    appliedConfig: () => applied,
    start,
    pause,
    resume,
    skip,
    addTime,
    stop,
    sync,
  }
}
