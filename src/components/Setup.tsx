import { createSignal, For, Show, type JSX } from 'solid-js'
import type { Config, Phase, Settings } from '../types'
import { MAX_PHASES, MAX_READY_SECS, MAX_ROUNDS, MIN_ROUNDS, formatSecs } from '../lib/time'
import { uid } from '../lib/storage'
import { isHapticsSupported } from '../lib/haptics'
import { phaseColor, phaseLabel } from '../phases'
import { PhaseRow } from './PhaseRow'
import { Stepper } from './Stepper'
import { TimeSheet } from './TimeSheet'
import { ToggleButton } from './ToggleButton'
import {
  IconHistory,
  IconPlus,
  IconShare,
  IconSound,
  IconSoundOff,
  IconVibrate,
} from './icons'

interface SetupProps {
  config: Config
  settings: Settings
  historyCount: number
  canStart: boolean
  totalSecs: number
  onConfig: (config: Config) => void
  onSettings: (settings: Settings) => void
  onStart: () => void
  onShare: () => void
  onHistory: () => void
}

function SettingRow(props: {
  title: string
  description: string
  children: JSX.Element
}): JSX.Element {
  return (
    <div class="flex items-center justify-between gap-4 rounded-2xl border border-line/70 bg-surface px-4 py-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-chalk">{props.title}</p>
        <p class="mt-0.5 text-[11px] text-muted">{props.description}</p>
      </div>
      {props.children}
    </div>
  )
}

export function Setup(props: SetupProps): JSX.Element {
  const [editingId, setEditingId] = createSignal<string | null>(null)

  const editing = (): Phase | null =>
    props.config.phases.find((phase) => phase.id === editingId()) ?? null

  const updatePhase = (id: string, patch: Partial<Phase>): void => {
    props.onConfig({
      ...props.config,
      phases: props.config.phases.map((phase) =>
        phase.id === id ? { ...phase, ...patch } : phase,
      ),
    })
  }

  const removePhase = (id: string): void => {
    props.onConfig({
      ...props.config,
      phases: props.config.phases.filter((phase) => phase.id !== id),
    })
    if (editingId() === id) setEditingId(null)
  }

  const addPhase = (): void => {
    if (props.config.phases.length >= MAX_PHASES) return
    const phase: Phase = { id: uid(), type: 'work', secs: 60 }
    props.onConfig({
      ...props.config,
      phases: [...props.config.phases, phase],
    })
  }

  const vibrationSupported = isHapticsSupported()
  const phaseCount = (): number => props.config.phases.length

  return (
    <div class="flex h-full flex-col">
      <header class="flex items-center justify-between px-5 pb-2 pt-safe">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-muted">Session</p>
          <h1 class="mt-0.5 text-lg font-semibold tracking-tight">
            Interval Timer
          </h1>
        </div>
        <div class="flex items-center gap-1.5">
          <ToggleButton
            pressed={props.settings.sound}
            label={props.settings.sound ? 'Mute sound' : 'Enable sound'}
            onClick={() =>
              props.onSettings({
                ...props.settings,
                sound: !props.settings.sound,
              })
            }
          >
            <Show
              when={props.settings.sound}
              fallback={<IconSoundOff class="h-[18px] w-[18px]" />}
            >
              <IconSound class="h-[18px] w-[18px]" />
            </Show>
          </ToggleButton>

          <ToggleButton
            pressed={props.settings.vibrate}
            label={
              vibrationSupported
                ? props.settings.vibrate
                  ? 'Disable vibration'
                  : 'Enable vibration'
                : 'Vibration is not supported on this device'
            }
            disabled={!vibrationSupported}
            onClick={() =>
              props.onSettings({
                ...props.settings,
                vibrate: !props.settings.vibrate,
              })
            }
          >
            <IconVibrate class="h-[18px] w-[18px]" />
          </ToggleButton>

          <button
            type="button"
            aria-label="Session history"
            title="Session history"
            onClick={props.onHistory}
            class="relative grid h-11 w-11 place-items-center rounded-full border border-line/70 text-muted/70 transition hover:text-chalk active:scale-95"
          >
            <IconHistory class="h-[18px] w-[18px]" />
            <Show when={props.historyCount > 0}>
              <span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-work" />
            </Show>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-5 pb-6">
        <div class="mx-auto w-full max-w-md">
          <section class="mt-4">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="text-[10px] uppercase tracking-[0.16em] text-muted">
                Phases
              </h2>
              <span class="text-[10px] text-muted">
                {phaseCount()} of {MAX_PHASES}
              </span>
            </div>

            <Show
              when={phaseCount() > 0}
              fallback={
                <div class="rounded-2xl border border-dashed border-line px-4 py-6 text-center">
                  <p class="text-sm text-muted">No phases yet.</p>
                  <p class="mt-1 text-xs text-muted">
                    Add work, rest, hot, cold or a changeover.
                  </p>
                </div>
              }
            >
              <div class="flex flex-col gap-2">
                <For each={props.config.phases}>
                  {(phase) => (
                    <PhaseRow
                      phase={phase}
                      onChange={(patch) => updatePhase(phase.id, patch)}
                      onRemove={() => removePhase(phase.id)}
                      onEdit={() => setEditingId(phase.id)}
                    />
                  )}
                </For>
              </div>
            </Show>

            <button
              type="button"
              onClick={addPhase}
              disabled={phaseCount() >= MAX_PHASES}
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-3 text-sm font-medium text-muted transition hover:border-line hover:text-chalk active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted"
            >
              <IconPlus class="h-4 w-4" />
              {phaseCount() >= MAX_PHASES ? 'Phase limit reached' : 'Add phase'}
            </button>
          </section>

          <section class="mt-6 flex flex-col gap-2">
            <SettingRow title="Rounds" description="The full sequence repeats">
              <Stepper
                label="rounds"
                value={props.config.rounds}
                min={MIN_ROUNDS}
                max={MAX_ROUNDS}
                onChange={(rounds) =>
                  props.onConfig({ ...props.config, rounds })
                }
              />
            </SettingRow>

            <SettingRow
              title="Get ready"
              description="Pause before every phase"
            >
              <Stepper
                label="get ready time"
                value={props.config.readySecs}
                min={0}
                max={MAX_READY_SECS}
                step={5}
                display={(secs) => (secs === 0 ? 'Off' : formatSecs(secs))}
                onChange={(readySecs) =>
                  props.onConfig({ ...props.config, readySecs })
                }
              />
            </SettingRow>
          </section>

          <button
            type="button"
            onClick={props.onShare}
            class="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-line/70 bg-surface/40 text-sm text-muted transition hover:text-chalk active:scale-[0.99]"
          >
            <IconShare class="h-4 w-4" />
            Share setup
          </button>

          <Show when={!vibrationSupported}>
            <p class="mt-3 text-center text-[11px] text-muted">
              Vibration is not available in this browser.
            </p>
          </Show>
        </div>
      </main>

      <footer class="shrink-0 border-t border-line/60 bg-ink/85 px-5 pb-safe pt-4 backdrop-blur">
        <div class="mx-auto flex w-full max-w-md items-center gap-4">
          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-[0.16em] text-muted">
              Total
            </p>
            <p
              data-testid="total"
              class="text-xl font-semibold leading-tight tabular-nums"
            >
              {formatSecs(props.totalSecs)}
            </p>
          </div>
          <button
            type="button"
            data-testid="start"
            disabled={!props.canStart}
            onClick={props.onStart}
            class="h-14 flex-1 rounded-2xl bg-chalk text-base font-semibold text-ink transition enabled:hover:bg-white enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted/50"
          >
            Start session
          </button>
        </div>
        <p class="mx-auto mt-2 hidden w-full max-w-md text-[11px] text-muted sm:block">
          Enter to start
        </p>
      </footer>

      <TimeSheet
        open={editing() !== null}
        value={editing()?.secs ?? 60}
        label={editing() ? phaseLabel(editing()!.type) : ''}
        color={editing() ? phaseColor(editing()!.type) : '#8e918d'}
        onChange={(secs) => {
          const phase = editing()
          if (phase) updatePhase(phase.id, { secs })
        }}
        onClose={() => setEditingId(null)}
      />
    </div>
  )
}
