import {
  Match,
  Switch,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import type { Config, HistoryEntry, Settings } from './types'
import {
  DEFAULT_CONFIG,
  appendHistory,
  loadConfig,
  loadHistory,
  loadSettings,
  saveConfig,
  saveHistory,
  saveSettings,
  uid,
} from './lib/storage'
import { acquireWakeLock } from './lib/wakelock'
import { unlockAudio } from './lib/audio'
import { encodeShare, readShareHash, clearShareHash } from './lib/share'
import { createSession } from './state/session'
import { Setup } from './components/Setup'
import { Run } from './components/Run'
import { Done } from './components/Done'
import { HistorySheet } from './components/HistorySheet'
import { Toast } from './components/Toast'

export default function App() {
  const [config, setConfig] = createSignal<Config>(loadConfig() ?? DEFAULT_CONFIG)
  const [settings, setSettings] = createSignal<Settings>(loadSettings())
  const [historyEntries, setHistoryEntries] = createSignal<HistoryEntry[]>(
    loadHistory(),
  )
  const [historyOpen, setHistoryOpen] = createSignal(false)
  const [toast, setToast] = createSignal<string | null>(null)

  let toastTimer: number | undefined

  const notify = (message: string): void => {
    setToast(message)
    if (toastTimer !== undefined) window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => setToast(null), 2400)
  }

  const session = createSession({
    getSettings: settings,
    onComplete: (applied, totalMs) => {
      const entry: HistoryEntry = {
        id: uid(),
        at: Date.now(),
        rounds: applied.rounds,
        readySecs: applied.readySecs,
        totalSecs: Math.round(totalMs / 1000),
        phases: applied.phases.map((phase) => ({
          type: phase.type,
          secs: phase.secs,
        })),
      }
      const next = appendHistory(historyEntries(), entry)
      setHistoryEntries(next)
      saveHistory(next)
    },
  })

  const totalSecs = createMemo(() => {
    const current = config()
    const phasesSecs = current.phases.reduce(
      (sum, phase) => sum + phase.secs,
      0,
    )
    const perRound = phasesSecs + current.readySecs * current.phases.length
    return current.rounds * perRound
  })

  const canStart = (): boolean => config().phases.length > 0

  const begin = (): void => {
    if (!canStart()) return
    saveConfig(config())
    session.start(config())
  }

  const repeat = (): void => {
    const applied = session.appliedConfig()
    if (applied) session.start(applied)
  }

  const updateSettings = (next: Settings): void => {
    setSettings(next)
    saveSettings(next)
  }

  const share = async (): Promise<void> => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}#c=${encodeShare(config())}`
    const payload = {
      title: 'Interval Timer',
      text: 'Interval Timer setup',
      url,
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      notify('Link copied')
    } catch {
      notify('Could not copy the link')
    }
  }

  const clearHistory = (): void => {
    setHistoryEntries([])
    saveHistory([])
    setHistoryOpen(false)
    notify('History cleared')
  }

  const handleKey = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return
    }
    if (document.querySelector('[role="dialog"]')) return

    const state = session.status()

    if (state === 'idle') {
      if (event.key === 'Enter') {
        event.preventDefault()
        begin()
      }
      return
    }

    if (state === 'done') {
      if (event.key === 'Enter') {
        event.preventDefault()
        repeat()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        session.stop()
      }
      return
    }

    if (event.key === ' ') {
      event.preventDefault()
      if (state === 'running') session.pause()
      else session.resume()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      session.skip()
    } else if (event.key === 's' || event.key === 'S') {
      session.addTime(30_000)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      session.stop()
    }
  }

  const handleVisibility = (): void => {
    if (document.visibilityState !== 'visible') return
    session.sync()
    if (session.status() === 'running' || session.status() === 'paused') {
      void acquireWakeLock()
    }
    if (settings().sound) unlockAudio()
  }

  onMount(() => {
    const shared = readShareHash()
    if (shared) {
      setConfig(shared)
      clearShareHash()
      notify('Shared setup loaded')
    }

    window.addEventListener('keydown', handleKey)
    document.addEventListener('visibilitychange', handleVisibility)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleKey)
    document.removeEventListener('visibilitychange', handleVisibility)
    if (toastTimer !== undefined) window.clearTimeout(toastTimer)
  })

  return (
    <div class="h-dvh overflow-hidden bg-ink text-chalk">
      <Switch>
        <Match when={session.status() === 'idle'}>
          <Setup
            config={config()}
            settings={settings()}
            historyCount={historyEntries().length}
            canStart={canStart()}
            totalSecs={totalSecs()}
            onConfig={setConfig}
            onSettings={updateSettings}
            onStart={begin}
            onShare={() => void share()}
            onHistory={() => setHistoryOpen(true)}
          />
        </Match>

        <Match when={session.status() === 'done'}>
          <Done
            rounds={session.appliedConfig()?.rounds ?? config().rounds}
            readySecs={session.appliedConfig()?.readySecs ?? config().readySecs}
            phases={
              session.appliedConfig()?.phases.map((phase) => ({
                type: phase.type,
                secs: phase.secs,
                color: phase.color,
                name: phase.name,
              })) ?? []
            }
            totalSecs={session.totalMs() / 1000}
            onRepeat={repeat}
            onEdit={session.stop}
          />
        </Match>

        <Match when={true}>
          <Run
            session={session}
            settings={settings()}
            onSettings={updateSettings}
          />
        </Match>
      </Switch>

      <HistorySheet
        open={historyOpen()}
        entries={historyEntries()}
        onClose={() => setHistoryOpen(false)}
        onClear={clearHistory}
      />
      <Toast message={toast()} />
    </div>
  )
}
