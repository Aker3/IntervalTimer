import type { JSX } from 'solid-js'

interface RingProps {
  progress: number
  color: string
  paused: boolean
}

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function Ring(props: RingProps): JSX.Element {
  return (
    <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        stroke-width="4"
      />
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        stroke={props.color}
        stroke-width="4"
        stroke-linecap="round"
        stroke-dasharray={`${CIRCUMFERENCE}`}
        stroke-dashoffset={`${CIRCUMFERENCE * (1 - props.progress)}`}
        class={[
          'transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none',
          props.paused ? 'opacity-40' : 'opacity-100',
        ].join(' ')}
      />
    </svg>
  )
}
