import { onCleanup, onMount, Show, type JSX } from 'solid-js'
import { IconX } from './icons'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: JSX.Element
}

export function Sheet(props: SheetProps): JSX.Element {
  onMount(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && props.open) {
        event.preventDefault()
        props.onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    onCleanup(() => window.removeEventListener('keydown', handleKey))
  })

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-black/60 backdrop-blur-[2px]"
        onClick={props.onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          class="sheet-in w-full max-w-md rounded-t-3xl border-t border-line bg-surface px-5 pb-safe pt-3"
          onClick={(event) => event.stopPropagation()}
        >
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-chalk">{props.title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={props.onClose}
              class="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:text-chalk active:scale-95"
            >
              <IconX class="h-4 w-4" />
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </Show>
  )
}
