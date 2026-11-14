import { createSignal, onCleanup, type JSX } from 'solid-js'

interface HoldButtonProps {
  onTrigger: () => void
  label: string
  holdMs?: number
  class?: string
  children: JSX.Element
}

/**
 * Fires only after the pointer has been held for `holdMs`. A keyboard
 * activation (Enter/Space) triggers immediately.
 */
export function HoldButton(props: HoldButtonProps): JSX.Element {
  const [holding, setHolding] = createSignal(false)
  let timer: number | undefined

  const cancel = (): void => {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
    setHolding(false)
  }

  const start = (event: PointerEvent): void => {
    if (event.button !== 0) return
    cancel()
    setHolding(true)
    timer = window.setTimeout(() => {
      timer = undefined
      setHolding(false)
      props.onTrigger()
    }, props.holdMs ?? 800)
  }

  onCleanup(cancel)

  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onClick={(event) => {
        // Keyboard activation produces detail === 0.
        if (event.detail === 0) props.onTrigger()
      }}
      class={[
        'touch-none select-none transition active:scale-95',
        holding() ? 'opacity-60' : '',
        props.class ?? '',
      ].join(' ')}
    >
      {props.children}
    </button>
  )
}
