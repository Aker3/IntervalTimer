import type { JSX } from 'solid-js'

interface IconProps {
  class?: string
}

function IconBase(props: IconProps & { children: JSX.Element }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      {props.children}
    </svg>
  )
}

export function IconSound(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15.5 8.8a5 5 0 0 1 0 6.4" />
      <path d="M18.3 6.2a9 9 0 0 1 0 11.6" />
    </IconBase>
  )
}

export function IconSoundOff(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="m16 9.5 5 5" />
      <path d="m21 9.5-5 5" />
    </IconBase>
  )
}

export function IconVibrate(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <rect x="8.5" y="5" width="7" height="14" rx="2" />
      <path d="M5 9.5v5" />
      <path d="M2.5 11v2" />
      <path d="M19 9.5v5" />
      <path d="M21.5 11v2" />
    </IconBase>
  )
}

export function IconHistory(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M3.2 12a8.8 8.8 0 1 0 2.6-6.3" />
      <path d="M3 4.5V9h4.5" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  )
}

export function IconPlus(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  )
}

export function IconTrash(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7 7.5 20h9L17.5 7" />
      <path d="M10.5 11v5M13.5 11v5" />
    </IconBase>
  )
}

export function IconShare(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M12 15.5V3.5" />
      <path d="m7.5 8 4.5-4.5L16.5 8" />
      <path d="M5 14v5.5h14V14" />
    </IconBase>
  )
}

export function IconX(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  )
}

export function IconChevronDown(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </IconBase>
  )
}

export function IconPause(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function IconPlay(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M8.5 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function IconSkip(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="M5.5 5.5v13l9-6.5-9-6.5Z" fill="currentColor" stroke="none" />
      <path d="M18 5.5v13" stroke-width="2" />
    </IconBase>
  )
}

export function IconCheck(props: IconProps): JSX.Element {
  return (
    <IconBase class={props.class}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </IconBase>
  )
}
