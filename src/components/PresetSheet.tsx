import { For, type JSX } from 'solid-js'
import type { Config } from '../types'
import { Sheet } from './Sheet'
import { PRESETS } from '../lib/presets'

interface PresetSheetProps {
  open: boolean
  onClose: () => void
  onApply: (config: Config) => void
}

export function PresetSheet(props: PresetSheetProps): JSX.Element {
  const categories = (): string[] => {
    const set = new Set<string>()
    for (const preset of PRESETS) set.add(preset.category)
    return [...set]
  }

  return (
    <Sheet open={props.open} title="Presets" onClose={props.onClose}>
      <p class="mt-1 text-xs text-muted">
        Load a typical interval setup. Replaces the current configuration.
      </p>
      <div class="mt-4 flex flex-col gap-4">
        <For each={categories()}>
          {(category) => (
            <section>
              <h3 class="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">
                {category}
              </h3>
              <div class="flex flex-col gap-2">
                <For each={PRESETS.filter((preset) => preset.category === category)}>
                  {(preset) => (
                    <button
                      type="button"
                      onClick={() => props.onApply(preset.config)}
                      class="flex items-center justify-between rounded-2xl border border-line/70 bg-surface px-4 py-3 text-left transition hover:border-line hover:bg-raised active:scale-[0.99]"
                    >
                      <span class="text-sm font-medium text-chalk">{preset.name}</span>
                      <span class="text-[11px] tabular-nums text-muted">
                        {preset.config.rounds}× · {preset.config.phases
                          .map((phase) => `${phase.secs}s`)
                          .join(' / ')}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </section>
          )}
        </For>
      </div>
    </Sheet>
  )
}
