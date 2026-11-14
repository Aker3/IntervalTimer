import type { PhaseType } from '../types'

let context: AudioContext | null = null
let master: GainNode | null = null

function getContext(): AudioContext | null {
  if (context) return context
  if (typeof window === 'undefined') return null

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextCtor) return null

  try {
    context = new AudioContextCtor()
  } catch {
    return null
  }

  master = context.createGain()
  master.gain.value = 0.16
  master.connect(context.destination)
  return context
}

/** Must be called from a user gesture at least once (mobile autoplay policy). */
export function unlockAudio(): void {
  const audioContext = getContext()
  if (audioContext && audioContext.state === 'suspended') {
    void audioContext.resume()
  }
}

function tone(
  frequency: number,
  offset: number,
  duration: number,
  type: OscillatorType = 'sine',
  level = 1,
): void {
  const audioContext = getContext()
  if (!audioContext || !master) return

  const start = audioContext.currentTime + offset
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(level, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(master)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.03)
}

const PHASE_FREQUENCY: Record<PhaseType, number> = {
  ready: 523.25,
  work: 783.99,
  rest: 392,
  hot: 880,
  cold: 349.23,
  swap: 587.33,
}

export const audio = {
  /** Two short blips pitched per phase type, so you can hear what comes next. */
  phase(type: PhaseType): void {
    const frequency = PHASE_FREQUENCY[type]
    tone(frequency, 0, 0.13, 'sine', 0.9)
    tone(frequency, 0.17, 0.13, 'sine', 0.9)
  },
  /** Countdown tick for the last three seconds of a phase. */
  tick(): void {
    tone(659.25, 0, 0.07, 'square', 0.35)
  },
  pause(): void {
    tone(329.63, 0, 0.1, 'sine', 0.5)
  },
  /** Ascending triad when the session is complete. */
  end(): void {
    ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
      tone(frequency, index * 0.19, 0.26, 'sine', 0.9)
    })
  },
}
