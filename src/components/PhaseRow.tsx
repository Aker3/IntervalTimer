import { For, type JSX } from 'solid-js'
import type { EditablePhaseType, Phase } from '../types'
import { PHASE_TYPES } from '../types'
import { PHASE_META, phaseColor } from '../phases'
import { clampSecs, formatSecs } from '../lib/time'
import { IconChevronDown, IconTrash } from './icons'

interface PhaseRowProps {
  phase: Phase
  onChange: (patch: Partial<Phase>) => void
  onRemove: () => void
  onEdit: () => void
}

export function PhaseRow(props: PhaseRowProps): JSX.Element {
  const color = (): string => phaseColor(props.phase.type)

  return (
    <div class="flex items-center gap-2 rounded-2xl border border-line/70 bg-surface px-3 py-2.5">
      <label class="relative flex min-w-0 items-center gap-2">
        <span
          class="h-2 w-2 shrink-0 rounded-full"
          style={{ 'background-color': color() }}
        />
        <select
          aria-label="Phase type"
          value={props.phase.type}
          onChange={(event) =>
            props.onChange({
              type: event.currentTarget.value as EditablePhaseType,
            })
          }
          class="min-w-0 cursor-pointer appearance-none bg-transparent pr-5 text-sm font-medium text-chalk outline-none"
        >
          <For each={PHASE_TYPES}>
            {(type) => (
              <option value={type} class="bg-surface text-chalk">
                {PHASE_META[type].label}
              </option>
            )}
          </For>
        </select>
        <IconChevronDown class="pointer-events-none absolute right-0 h-3.5 w-3.5 text-muted" />
      </label>

      <div class="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          aria-label="Decrease duration"
          onClick={() => props.onChange({ secs: clampSecs(props.phase.secs - 5) })}
          class="grid h-10 w-9 place-items-center rounded-lg text-base text-muted transition hover:text-chalk active:bg-raised"
        >
          <span aria-hidden="true" class="-mt-0.5">
            −
          </span>
        </button>
        <button
          type="button"
          aria-label={`Edit duration, currently ${formatSecs(props.phase.secs)}`}
          onClick={props.onEdit}
          class="min-w-14 rounded-lg px-1 py-1.5 text-base font-semibold tabular-nums text-chalk transition hover:bg-raised active:bg-raised"
        >
          {formatSecs(props.phase.secs)}
        </button>
        <button
          type="button"
          aria-label="Increase duration"
          onClick={() => props.onChange({ secs: clampSecs(props.phase.secs + 5) })}
          class="grid h-10 w-9 place-items-center rounded-lg text-muted transition hover:text-chalk active:bg-raised"
        >
          <span aria-hidden="true" class="-mt-0.5">
            +
          </span>
        </button>
        <button
          type="button"
          aria-label={`Remove ${PHASE_META[props.phase.type].label} phase`}
          onClick={props.onRemove}
          class="ml-0.5 grid h-10 w-9 place-items-center rounded-lg text-muted/70 transition hover:text-chalk active:bg-raised"
        >
          <IconTrash class="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
