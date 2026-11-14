import type { JSX } from 'solid-js'

interface ToggleButtonProps {
  pressed: boolean
  label: string
  onClick: () => void
  disabled?: boolean
  children: JSX.Element
}

export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={props.pressed}
      aria-label={props.label}
      title={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      class={[
        'relative grid h-11 w-11 place-items-center rounded-full border border-line/70 transition active:scale-95',
        props.disabled
          ? 'cursor-not-allowed text-muted/35'
          : props.pressed
            ? 'text-chalk'
            : 'text-muted/70 hover:text-chalk',
      ].join(' ')}
    >
      <span class="grid h-[18px] w-[18px] place-items-center">{props.children}</span>
      <span
        class={[
          'absolute bottom-1.5 h-1 w-1 rounded-full bg-chalk transition-opacity',
          props.pressed ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
    </button>
  )
}
