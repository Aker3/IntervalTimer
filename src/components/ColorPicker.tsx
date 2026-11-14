import { For, Show, createSignal, onCleanup, onMount, type JSX } from 'solid-js'
import { PRESET_COLORS } from '../lib/colors'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const [open, setOpen] = createSignal(false)
  let root: HTMLDivElement | undefined

  const onDocClick = (event: MouseEvent): void => {
    if (root && !root.contains(event.target as Node)) setOpen(false)
  }

  onMount(() => document.addEventListener('mousedown', onDocClick))
  onCleanup(() => document.removeEventListener('mousedown', onDocClick))

  return (
    <div ref={root} class="relative shrink-0">
      <button
        type="button"
        aria-label="Choose color"
        onClick={() => setOpen((value) => !value)}
        class="h-8 w-8 rounded-full border-2 border-line/70 shadow-sm transition hover:scale-110 active:scale-95"
        style={{ 'background-color': props.color }}
      />
      <Show when={open()}>
        <div class="absolute left-0 top-10 z-40 w-72 rounded-2xl border border-line/70 bg-raised p-3 shadow-2xl">
          <p class="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">
            16 Tailwind colors
          </p>
          <div class="grid grid-cols-8 gap-1.5">
            <For each={PRESET_COLORS}>
              {(color) => (
                <button
                  type="button"
                  aria-label={color}
                  onClick={() => {
                    props.onChange(color)
                    setOpen(false)
                  }}
                  class="relative h-7 w-7 rounded-lg transition hover:scale-110 active:scale-95"
                  style={{ 'background-color': color }}
                >
                  <Show when={color.toLowerCase() === props.color.toLowerCase()}>
                    <span class="absolute inset-0 grid place-items-center text-[10px] font-bold text-white drop-shadow">
                      ✓
                    </span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}
