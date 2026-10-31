<script lang="ts">
  import type { Locale } from '../lib/i18n/translate'

  interface Props {
    locale: Locale
    class?: string
  }

  let { locale, class: className = 'h-4 w-6' }: Props = $props()

  const id = $props.id()
</script>

<!-- Drawn by hand: state flags are public domain, and emoji flags do not render on Windows. -->
<svg
  class="shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.15)] {className}"
  viewBox={locale === 'de' ? '0 0 5 3' : '0 0 60 30'}
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
>
  {#if locale === 'de'}
    <rect width="5" height="1" y="0" fill="#000" />
    <rect width="5" height="1" y="1" fill="#dd0000" />
    <rect width="5" height="1" y="2" fill="#ffce00" />
  {:else}
    <clipPath id="{id}-diagonals">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <rect width="60" height="30" fill="#012169" />
    <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6" />
    <path
      d="M0 0l60 30m0-30L0 30"
      clip-path="url(#{id}-diagonals)"
      stroke="#c8102e"
      stroke-width="4"
    />
    <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
    <path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6" />
  {/if}
</svg>
