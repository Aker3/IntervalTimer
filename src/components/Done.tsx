import { For, Show, type JSX } from 'solid-js'
import type { EditablePhaseType } from '../types'
import { phaseColor, phaseLabel } from '../phases'
import { formatSecs } from '../lib/time'
import { IconCheck } from './icons'

interface DoneProps {
  rounds: number
  totalSecs: number
  readySecs: number
  phases: Array<{ type: EditablePhaseType; secs: number; color?: string; name?: string }>
  onRepeat: () => void
  onEdit: () => void
}

export function Done(props: DoneProps): JSX.Element {
  return (
    <div
      data-testid="done"
      class="flex h-full flex-col items-center justify-center px-6 pb-safe pt-safe"
    >
      <div class="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-chalk">
        <IconCheck class="h-6 w-6" />
      </div>

      <h1 class="mt-5 text-2xl font-semibold tracking-tight">
        Session complete
      </h1>
      <p class="mt-2 text-sm text-muted">
        {props.rounds} {props.rounds === 1 ? 'round' : 'rounds'}
        <span class="mx-1.5 text-line">·</span>
        <span class="tabular-nums">{formatSecs(props.totalSecs)}</span>
      </p>

      <div class="mt-6 flex max-w-sm flex-wrap justify-center gap-x-3 gap-y-2">
        <For each={props.phases}>
          {(phase) => (
            <span class="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span
                class="h-1.5 w-1.5 rounded-full"
                style={{ 'background-color': phaseColor(phase) }}
              />
              {phaseLabel(phase)}
              <span class="tabular-nums text-muted">
                {formatSecs(phase.secs)}
              </span>
            </span>
          )}
        </For>
        <Show when={props.readySecs > 0}>
          <span class="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span class="h-1.5 w-1.5 rounded-full bg-muted" />
            Get ready
            <span class="tabular-nums text-muted">
              {formatSecs(props.readySecs)}
            </span>
          </span>
        </Show>
      </div>

      <div class="mt-9 flex w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={props.onEdit}
          class="h-14 flex-1 rounded-2xl border border-line bg-surface text-sm font-medium text-chalk transition active:scale-[0.99]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={props.onRepeat}
          class="h-14 flex-1 rounded-2xl bg-chalk text-sm font-semibold text-ink transition active:scale-[0.99]"
        >
          Again
        </button>
      </div>
    </div>
  )
}
