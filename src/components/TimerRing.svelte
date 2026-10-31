<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte'

  interface Props {
    /** Fraction of the current phase that has passed, 0…1. */
    progress: number
    digits: string
    label: string
    color: string
    paused: boolean
    image?: string
    /** Flip the image, so one picture serves both sides. */
    mirrored?: boolean
    ontoggle: () => void
  }

  let {
    progress,
    digits,
    label,
    color,
    paused,
    image,
    mirrored = false,
    ontoggle,
  }: Props = $props()

  const id = $props.id()
  const RADIUS = 90
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  const digitSize = $derived(digits.length <= 2 ? 80 : digits.length <= 4 ? 60 : 46)
</script>

<!-- The square is sized by the parent's container query so the ring always fits. -->
<div class="grid h-full w-full place-items-center" style="container-type: size">
  <button
    type="button"
    class="rounded-full focus-visible:outline-offset-4"
    style="width: min(100cqw, 100cqh); height: min(100cqw, 100cqh)"
    aria-label={paused ? t('player.resume') : t('player.pause')}
    onclick={ontoggle}
  >
    <svg viewBox="0 0 200 200" class="h-full w-full" role="img" aria-label="{label}: {digits}">
      <defs>
        <clipPath id="{id}-clip">
          <circle cx="100" cy="100" r={RADIUS - 9} />
        </clipPath>
      </defs>

      {#if image}
        <g transform={mirrored ? 'translate(200 0) scale(-1 1)' : undefined}>
          <image
            href={image}
            x="9"
            y="9"
            width="182"
            height="182"
            preserveAspectRatio="xMidYMid slice"
            clip-path="url(#{id}-clip)"
          />
        </g>
        <circle cx="100" cy="100" r={RADIUS - 9} fill="black" opacity="0.5" />
      {/if}

      <circle
        cx="100"
        cy="100"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        class="text-tint/8"
        stroke-width="10"
      />
      <circle
        cx="100"
        cy="100"
        r={RADIUS}
        fill="none"
        stroke={color}
        stroke-width="10"
        stroke-linecap="round"
        stroke-dasharray={CIRCUMFERENCE}
        stroke-dashoffset={CIRCUMFERENCE * Math.min(1, Math.max(0, progress))}
        transform="rotate(-90 100 100)"
        style="transition: stroke 300ms"
      />

      <text
        x="100"
        y="50"
        text-anchor="middle"
        fill={color}
        font-size="10"
        font-weight="600"
        letter-spacing="1.5"
        style="transition: fill 300ms">{label.toUpperCase()}</text
      >
      <text
        x="100"
        y="106"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="currentColor"
        font-size={digitSize}
        font-weight="700"
        letter-spacing="-2">{digits}</text
      >
      {#if paused}
        <text
          x="100"
          y="150"
          text-anchor="middle"
          class="fill-muted"
          font-size="11"
          font-weight="500"
          letter-spacing="1">{t('player.paused').toUpperCase()}</text
        >
      {/if}
    </svg>
  </button>
</div>
