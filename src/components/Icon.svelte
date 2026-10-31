<script lang="ts" module>
  // Stroke icons on a 24×24 grid, in the style of Lucide.
  const PATHS = {
    play: 'M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z',
    pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
    prev: 'M18 19 8 12l10-7v14ZM6 5v14',
    next: 'M6 5l10 7-10 7V5ZM18 5v14',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 6l12 12M18 6 6 18',
    volume: 'M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
    mute: 'M11 5 6 9H3v6h3l5 4V5ZM22 9l-6 6M16 9l6 6',
    back: 'M15 18l-6-6 6-6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
    check: 'M5 12l5 5L20 7',
    edit: 'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    up: 'M6 15l6-6 6 6',
    down: 'M6 9l6 6 6-6',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    dumbbell: 'M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12',
    database:
      'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    home: 'M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5',
    download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
    upload: 'M12 20V8M7 13l5-5 5 5M5 4h14',
    swap: 'M7 7h13l-4-4M17 17H4l4 4',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-4M12 8h.01',
  } as const

  export type IconName = keyof typeof PATHS
</script>

<script lang="ts">
  interface Props {
    name: IconName
    class?: string
    filled?: boolean
  }

  let { name, class: className = 'size-6', filled = false }: Props = $props()
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill={filled ? 'currentColor' : 'none'}
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={PATHS[name]} />
</svg>
