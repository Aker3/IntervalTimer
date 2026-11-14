import type { JSX } from 'solid-js'
import { clampInt } from '../lib/time'
import { IconPlus } from './icons'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  display?: (value: number) => string
}

export function Stepper(props: StepperProps): JSX.Element {
  const step = (): number => props.step ?? 1
  const display = (): string =>
    props.display ? props.display(props.value) : String(props.value)

  const change = (delta: number): void => {
    props.onChange(clampInt(props.value + delta, props.min, props.max))
  }

  return (
    <div class="flex items-center gap-0.5 rounded-xl border border-line/70 bg-ink/40 p-1">
      <button
        type="button"
        aria-label={`Decrease ${props.label}`}
        disabled={props.value <= props.min}
        onClick={() => change(-step())}
        class="grid h-9 w-9 place-items-center rounded-lg text-base text-muted transition enabled:hover:text-chalk enabled:active:bg-raised disabled:opacity-30"
      >
        <span aria-hidden="true" class="-mt-0.5">
          −
        </span>
      </button>
      <span class="min-w-10 text-center text-sm font-medium tabular-nums text-chalk">
        {display()}
      </span>
      <button
        type="button"
        aria-label={`Increase ${props.label}`}
        disabled={props.value >= props.max}
        onClick={() => change(step())}
        class="grid h-9 w-9 place-items-center rounded-lg text-muted transition enabled:hover:text-chalk enabled:active:bg-raised disabled:opacity-30"
      >
        <IconPlus class="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
