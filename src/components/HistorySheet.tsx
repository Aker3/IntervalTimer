import { For, Show, type JSX } from 'solid-js'
import type { HistoryEntry } from '../types'
import { phaseColor, phaseLabel } from '../phases'
import { formatSecs } from '../lib/time'
import { Sheet } from './Sheet'

interface HistorySheetProps {
  open: boolean
  entries: HistoryEntry[]
  onClose: () => void
  onClear: () => void
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function HistorySheet(props: HistorySheetProps): JSX.Element {
  return (
    <Sheet open={props.open} title="Recent sessions" onClose={props.onClose}>
      <Show
        when={props.entries.length > 0}
        fallback={
          <p class="mt-6 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            Completed sessions will appear here.
          </p>
        }
      >
        <ul class="mt-4 flex max-h-[55dvh] flex-col gap-2 overflow-y-auto">
          <For each={props.entries}>
            {(entry) => (
              <li class="rounded-2xl border border-line/70 bg-ink/40 px-4 py-3">
                <div class="flex items-baseline justify-between gap-3">
                  <p class="text-sm font-medium tabular-nums text-chalk">
                    {entry.rounds}{' '}
                    {entry.rounds === 1 ? 'round' : 'rounds'}
                    <span class="mx-1.5 text-line">·</span>
                    {formatSecs(entry.totalSecs)}
                  </p>
                  <p class="shrink-0 text-[10px] text-muted">
                    {dateFormat.format(entry.at)}
                  </p>
                </div>
                <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <For each={entry.phases}>
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
                </div>
              </li>
            )}
          </For>
        </ul>

        <button
          type="button"
          onClick={props.onClear}
          class="mt-4 h-11 w-full rounded-xl border border-line/70 text-xs font-medium text-muted transition hover:text-chalk active:scale-[0.99]"
        >
          Clear history
        </button>
      </Show>
    </Sheet>
  )
}
