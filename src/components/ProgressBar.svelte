<script lang="ts">
  import { formatClock } from '../lib/util/format'

  interface Props {
    elapsedSeconds: number
    totalSeconds: number
  }

  let { elapsedSeconds, totalSeconds }: Props = $props()

  const fraction = $derived(totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0)
</script>

<div class="flex shrink-0 flex-col gap-1.5">
  <div
    class="h-1.5 overflow-hidden rounded-full bg-tint/8"
    role="progressbar"
    aria-label="Gesamtfortschritt"
    aria-valuemin={0}
    aria-valuemax={totalSeconds}
    aria-valuenow={Math.floor(elapsedSeconds)}
  >
    <div
      class="h-full origin-left rounded-full bg-fg/80"
      style="transform: scaleX({fraction})"
    ></div>
  </div>
  <div class="flex justify-between text-xs font-medium text-muted tabular-nums">
    <span>{formatClock(elapsedSeconds)}</span>
    <span>{formatClock(totalSeconds)}</span>
  </div>
</div>
