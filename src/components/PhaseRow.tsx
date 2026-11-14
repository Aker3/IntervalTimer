import { For, Show, createSignal, onCleanup, onMount, type JSX } from 'solid-js'
import type { Phase } from '../types'
import { PHASE_TYPES } from '../types'
import { PHASE_META, phaseColor, phaseLabel } from '../phases'
import { clampSecs, formatSecs } from '../lib/time'
import { ColorPicker } from './ColorPicker'
import { IconTrash } from './icons'

interface PhaseRowProps {
  phase: Phase
  onChange: (patch: Partial<Phase>) => void
  onRemove: () => void
  onEdit: () => void
}

export function PhaseRow(props: PhaseRowProps): JSX.Element {
  const [typeOpen, setTypeOpen] = createSignal(false)
  let typeRoot: HTMLDivElement | undefined

  const onDocClick = (event: MouseEvent): void => {
    if (typeRoot && !typeRoot.contains(event.target as Node)) setTypeOpen(false)
  }
  onMount(() => document.addEventListener('mousedown', onDocClick))
  onCleanup(() => document.removeEventListener('mousedown', onDocClick))

  return (
    <div class="flex flex-col gap-2 rounded-2xl border border-line/70 bg-surface px-3 py-2.5">
      <div class="flex items-center gap-2">
        <ColorPicker color={phaseColor(props.phase)} onChange={(color) => props.onChange({ color })} />

        <div ref={typeRoot} class="relative shrink-0">
          <button
            type="button"
            onClick={() => setTypeOpen((value) => !value)}
            class="flex items-center gap-1.5 rounded-full border border-line/70 bg-ink/40 px-2.5 py-1 text-xs font-medium transition hover:border-line active:scale-95"
            style={{ color: PHASE_META[props.phase.type].color }}
          >
            <span
              class="h-2 w-2 rounded-full"
              style={{ 'background-color': PHASE_META[props.phase.type].color }}
            />
            {PHASE_META[props.phase.type].label}
          </button>
          <Show when={typeOpen()}>
            <div class="absolute left-0 top-8 z-30 flex flex-col gap-1 rounded-xl border border-line/70 bg-raised p-2 shadow-xl">
              <For each={PHASE_TYPES}>
                {(type) => (
                  <button
                    type="button"
                    onClick={() => {
                      props.onChange({ type })
                      setTypeOpen(false)
                    }}
                    class={[
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium transition hover:bg-surface active:scale-95',
                      props.phase.type === type ? 'bg-surface text-chalk' : 'text-muted',
                    ].join(' ')}
                  >
                    <span
                      class="h-2.5 w-2.5 rounded-full"
                      style={{ 'background-color': PHASE_META[type].color }}
                    />
                    {PHASE_META[type].label}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>

        <input
          type="text"
          value={props.phase.name ?? ''}
          onInput={(event) => props.onChange({ name: event.currentTarget.value })}
          placeholder={phaseLabel(props.phase.type)}
          aria-label="Interval name"
          class="h-9 min-w-0 flex-1 rounded-lg border border-line/70 bg-ink/40 px-2.5 text-sm text-chalk placeholder:text-muted/60 focus:border-line focus:outline-none"
        />

        <button
          type="button"
          aria-label={`Remove ${phaseLabel(props.phase)} interval`}
          onClick={props.onRemove}
          class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted/70 transition hover:text-chalk active:bg-raised"
        >
          <IconTrash class="h-4 w-4" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Edit duration, currently ${formatSecs(props.phase.secs)}`}
          onClick={props.onEdit}
          class="min-w-12 rounded-lg px-1 py-1.5 text-sm font-semibold tabular-nums text-chalk transition hover:bg-raised active:bg-raised"
        >
          {formatSecs(props.phase.secs)}
        </button>
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Decrease duration"
            onClick={() => props.onChange({ secs: clampSecs(props.phase.secs - 5) })}
            class="grid h-9 w-8 place-items-center rounded-lg text-base text-muted transition hover:text-chalk active:bg-raised"
          >
            <span aria-hidden="true" class="-mt-0.5">
              −
            </span>
          </button>
          <button
            type="button"
            aria-label="Increase duration"
            onClick={() => props.onChange({ secs: clampSecs(props.phase.secs + 5) })}
            class="grid h-9 w-8 place-items-center rounded-lg text-muted transition hover:text-chalk active:bg-raised"
          >
            <span aria-hidden="true" class="-mt-0.5">
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
