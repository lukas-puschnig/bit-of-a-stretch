<script lang="ts">
  import { PHASE_COLOR } from '../lib/model/phaseStyle'
  import type { Phase } from '../lib/model/types'

  interface Props {
    phases: Phase[]
    totalSeconds: number
    elapsedSeconds: number
  }

  let { phases, totalSeconds, elapsedSeconds }: Props = $props()

  /** Seconds of the routine visible across the full width. */
  const VISIBLE_SECONDS = 240

  let width = $state(0)

  // Scale so short routines still fill the width.
  const pxPerSecond = $derived(
    totalSeconds > 0 ? Math.max(width / VISIBLE_SECONDS, width / totalSeconds) : 0,
  )
  const stripWidth = $derived(totalSeconds * pxPerSecond)
  const position = $derived(elapsedSeconds * pxPerSecond)
  // Keep the marker centered while the strip scrolls; at either end the strip
  // stops and the marker travels to the screen edge instead.
  const offset = $derived(Math.min(0, Math.max(width / 2 - position, width - stripWidth)))
</script>

<div class="relative h-9 shrink-0 overflow-hidden" bind:clientWidth={width} aria-hidden="true">
  <div
    class="absolute inset-y-2 left-0 will-change-transform"
    style="width: {stripWidth}px; transform: translateX({offset}px)"
  >
    {#each phases as phase (phase.start)}
      {@const past = phase.start + phase.duration <= elapsedSeconds}
      <div
        class="absolute inset-y-0 px-px"
        style="left: {phase.start * pxPerSecond}px; width: {phase.duration * pxPerSecond}px"
      >
        <div
          class="h-full rounded-[3px] transition-opacity duration-500"
          style="background: {PHASE_COLOR[phase.kind]}; opacity: {past ? 0.3 : 0.9}"
        ></div>
      </div>
    {/each}
  </div>
  <div
    class="absolute inset-y-0 left-0 w-1 rounded-full bg-marker shadow-[0_0_12px_var(--color-marker)]"
    style="transform: translateX({offset + position}px) translateX(-50%)"
  ></div>
</div>
