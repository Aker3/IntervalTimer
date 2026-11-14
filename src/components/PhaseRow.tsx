import { type JSX } from 'solid-js'
import type { Phase } from '../types'
import { phaseColor, phaseLabel } from '../phases'
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
  return (
    <div class="flex flex-col gap-2 rounded-2xl border border-line/70 bg-surface px-3 py-2.5">
      <div class="flex items-center gap-2">
        <ColorPicker color={phaseColor(props.phase)} onChange={(color) => props.onChange({ color })} />

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
