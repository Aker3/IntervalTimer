import { Show, type JSX } from 'solid-js'
import type { Settings } from '../types'
import type { SessionApi } from '../state/session'
import { phaseColor, phaseLabel } from '../phases'
import { formatMs, formatSecs } from '../lib/time'
import { HoldButton } from './HoldButton'
import { Ring } from './Ring'
import { ToggleButton } from './ToggleButton'
import {
  IconPause,
  IconPlay,
  IconSkip,
  IconSound,
  IconSoundOff,
  IconVibrate,
} from './icons'

interface RunProps {
  session: SessionApi
  settings: Settings
  onSettings: (settings: Settings) => void
}

export function Run(props: RunProps): JSX.Element {
  const current = () => props.session.step()
  const type = () => current()?.type ?? 'ready'
  const color = () => phaseColor(type())
  const isReady = () => type() === 'ready'
  const paused = () => props.session.status() === 'paused'
  const rounds = () => props.session.appliedConfig()?.rounds ?? 1
  const remainingSecs = () =>
    Math.max(0, Math.ceil(props.session.remainingMs() / 1000))

  const nextInfo = () => {
    const next = props.session.next()
    if (!next) return null
    return {
      label: phaseLabel(next.type),
      time: formatMs(next.endMs - next.startMs),
    }
  }

  const toggle = (): void => {
    if (paused()) props.session.resume()
    else props.session.pause()
  }

  return (
    <div
      class="flex h-full flex-col transition-colors duration-500"
      style={{
        'background-color': `color-mix(in srgb, ${color()} 8%, #0b0c0c)`,
      }}
    >
      <span class="sr-only" aria-live="polite">
        {isReady()
          ? 'Get ready'
          : `${phaseLabel(type())}, round ${current()?.round ?? 1} of ${rounds()}`}
      </span>

      <header class="flex items-center justify-between px-5 pb-2 pt-safe">
        <p class="text-[10px] uppercase tracking-[0.2em] text-muted">
          Interval Timer
        </p>
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
            label={props.settings.vibrate ? 'Disable vibration' : 'Enable vibration'}
            onClick={() =>
              props.onSettings({
                ...props.settings,
                vibrate: !props.settings.vibrate,
              })
            }
          >
            <IconVibrate class="h-[18px] w-[18px]" />
          </ToggleButton>

          <HoldButton
            label="Hold to end the session"
            holdMs={800}
            onTrigger={props.session.stop}
            class="ml-1 rounded-full border border-line/70 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-muted"
          >
            Hold to end
          </HoldButton>
        </div>
      </header>

      <main class="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <div class="relative h-[min(64vw,17rem)] w-[min(64vw,17rem)]">
          <Ring
            progress={props.session.progress()}
            color={color()}
            paused={paused()}
          />
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <p
              data-testid="phase"
              class="text-[10px] font-medium uppercase tracking-[0.22em]"
              style={{ color: color() }}
            >
              {phaseLabel(type())}
            </p>
            <p
              data-testid="clock"
              class="mt-1.5 text-[clamp(3.2rem,17vw,5rem)] font-semibold leading-none tabular-nums"
            >
              {formatSecs(remainingSecs())}
            </p>
            <p
              data-testid="round-state"
              class="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted"
            >
              {paused()
                ? 'Paused'
                : `Round ${current()?.round ?? 1} / ${rounds()}`}
            </p>
          </div>
        </div>

        <Show
          when={nextInfo()}
          fallback={
            <p class="mt-6 text-xs text-muted">Last phase</p>
          }
        >
          {(info) => (
            <p data-testid="next" class="mt-6 text-xs text-muted">
              Next <span class="font-medium text-chalk">{info().label}</span>
              <span class="mx-1.5 text-line">·</span>
              <span class="tabular-nums">{info().time}</span>
            </p>
          )}
        </Show>
      </main>

      <footer class="shrink-0 px-5 pb-safe pt-4">
        <div class="mx-auto grid w-full max-w-md grid-cols-3 items-center gap-3">
          <button
            type="button"
            aria-label="Add 30 seconds"
            onClick={() => props.session.addTime(30_000)}
            class="flex h-14 items-center justify-center rounded-2xl border border-line/70 bg-surface/60 text-sm font-semibold text-chalk transition active:scale-95"
          >
            +30s
          </button>

          <button
            type="button"
            aria-label={paused() ? 'Resume session' : 'Pause session'}
            onClick={toggle}
            class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-chalk text-ink transition active:scale-95"
          >
            <Show
              when={paused()}
              fallback={<IconPause class="h-7 w-7" />}
            >
              <IconPlay class="ml-0.5 h-7 w-7" />
            </Show>
          </button>

          <button
            type="button"
            aria-label="Skip phase"
            onClick={props.session.skip}
            class="flex h-14 items-center justify-center rounded-2xl border border-line/70 bg-surface/60 text-chalk transition active:scale-95"
          >
            <IconSkip class="h-5 w-5" />
          </button>
        </div>

        <p class="mx-auto mt-3 hidden w-full max-w-md text-center text-[11px] text-muted sm:block">
          Space pause · Right arrow skip · S +30s · Esc end
        </p>
      </footer>
    </div>
  )
}
