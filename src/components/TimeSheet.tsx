import { createEffect, createSignal, For, type JSX } from 'solid-js'
import {
  MAX_PHASE_SECS,
  clampSecs,
  formatSecs,
  parseDuration,
} from '../lib/time'
import { HoldButton } from './HoldButton'
import { Sheet } from './Sheet'

interface TimeSheetProps {
  open: boolean
  value: number
  label: string
  color: string
  onChange: (secs: number) => void
  onClose: () => void
}

const QUICK_SECS = [10, 30, 60, 180, 300, 600, 900, 1800, 3600]

export function TimeSheet(props: TimeSheetProps): JSX.Element {
  const [text, setText] = createSignal('')
  const [error, setError] = createSignal(false)

  createEffect(() => {
    if (props.open) {
      setText('')
      setError(false)
    }
  })

  const applyText = (): void => {
    const parsed = parseDuration(text())
    if (parsed === null) {
      setError(true)
      return
    }
    props.onChange(clampSecs(parsed))
    setText('')
    setError(false)
  }

  return (
    <Sheet open={props.open} title="Duration" onClose={props.onClose}>
      <div class="mt-4 flex items-center justify-between rounded-2xl border border-line/60 bg-ink/40 px-4 py-5">
        <HoldButton
          label="Decrease by 5 seconds"
          onTrigger={() => props.onChange(clampSecs(props.value - 5))}
          class="grid h-14 w-14 place-items-center rounded-2xl bg-raised text-2xl text-chalk"
        >
          <span aria-hidden="true" class="-mt-0.5">
            −
          </span>
        </HoldButton>

        <div class="text-center">
          <p class="text-4xl font-semibold tabular-nums leading-none">
            {formatSecs(props.value)}
          </p>
          <p
            class="mt-2 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: props.color }}
          >
            {props.label}
          </p>
        </div>

        <HoldButton
          label="Increase by 5 seconds"
          onTrigger={() => props.onChange(clampSecs(props.value + 5))}
          class="grid h-14 w-14 place-items-center rounded-2xl bg-raised text-2xl text-chalk"
        >
          <span aria-hidden="true" class="-mt-0.5">
            +
          </span>
        </HoldButton>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <For each={QUICK_SECS}>
          {(secs) => (
            <button
              type="button"
              onClick={() => props.onChange(clampSecs(secs))}
              class={[
                'rounded-full border px-3 py-1.5 text-xs tabular-nums transition active:scale-95',
                props.value === secs
                  ? 'border-chalk/40 bg-raised text-chalk'
                  : 'border-line/70 text-muted hover:text-chalk',
              ].join(' ')}
            >
              {formatSecs(secs)}
            </button>
          )}
        </For>
      </div>

      <form
        class="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          applyText()
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          aria-label="Exact duration"
          placeholder="e.g. 90 or 1:30"
          value={text()}
          onInput={(event) => {
            setText(event.currentTarget.value)
            setError(false)
          }}
          class={[
            'h-12 min-w-0 flex-1 rounded-xl border bg-ink/40 px-3 text-base tabular-nums text-chalk placeholder:text-muted/80',
            error() ? 'border-red-400/60' : 'border-line/70',
          ].join(' ')}
        />
        <button
          type="submit"
          class="h-12 rounded-xl bg-chalk px-4 text-sm font-semibold text-ink transition active:scale-[0.98]"
        >
          Set
        </button>
      </form>
      <p class="mt-2 text-[11px] text-muted">
        Type seconds or mm:ss · 1 s to {formatSecs(MAX_PHASE_SECS)}
      </p>

      <button
        type="button"
        onClick={props.onClose}
        class="mt-4 h-12 w-full rounded-xl bg-raised text-sm font-medium text-chalk transition active:scale-[0.99]"
      >
        Done
      </button>
    </Sheet>
  )
}
