export function isHapticsSupported(): boolean {
  return (
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  )
}

function vibrate(pattern: number | number[]): void {
  if (!isHapticsSupported()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Vibration can be blocked by the browser or the OS.
  }
}

export const haptic = {
  phase: (): void => vibrate([40, 60, 40]),
  tick: (): void => vibrate(25),
  end: (): void => vibrate([140, 90, 140, 90, 240]),
  pause: (): void => vibrate(30),
}
