interface WakeLockSentinelLike {
  release: () => Promise<void>
  addEventListener?: (type: 'release', listener: () => void) => void
}

interface WakeLockApi {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

interface WakeLockNavigator {
  wakeLock?: WakeLockApi
}

let sentinel: WakeLockSentinelLike | null = null
let pending: Promise<void> | null = null

export function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

export async function acquireWakeLock(): Promise<void> {
  if (!isWakeLockSupported() || sentinel) return
  if (pending) return pending

  pending = (async () => {
    try {
      const api = (navigator as Navigator & WakeLockNavigator).wakeLock
      if (!api) return
      const lock = await api.request('screen')
      sentinel = lock
      lock.addEventListener?.('release', () => {
        sentinel = null
      })
    } catch {
      // Denied, unsupported or blocked by battery saver.
    }
  })()

  try {
    await pending
  } finally {
    pending = null
  }
}

export function releaseWakeLock(): void {
  const lock = sentinel
  sentinel = null
  if (lock) {
    void lock.release().catch(() => {
      // Already released.
    })
  }
}
