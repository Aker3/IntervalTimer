import { Show, type JSX } from 'solid-js'

interface ToastProps {
  message: string | null
}

export function Toast(props: ToastProps): JSX.Element {
  return (
    <Show when={props.message}>
      <div class="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-50 flex justify-center px-4">
        <p
          data-testid="toast"
          class="toast-in rounded-full border border-line bg-raised/95 px-4 py-2 text-xs text-chalk"
        >
          {props.message}
        </p>
      </div>
    </Show>
  )
}
