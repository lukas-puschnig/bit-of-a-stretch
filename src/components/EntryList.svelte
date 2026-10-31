<script lang="ts">
  import { SIDE_LABEL } from '../lib/model/phaseStyle'
  import type { ResolvedEntry } from '../lib/model/types'
  import { formatDuration } from '../lib/util/format'

  interface Props {
    entries: ResolvedEntry[]
    /** Entry currently playing or coming up next. */
    current: number
    onselect?: (index: number) => void
  }

  let { entries, current, onselect }: Props = $props()

  let list: HTMLOListElement | undefined = $state()

  $effect(() => {
    const item = list?.querySelector<HTMLElement>(`[data-index="${current}"]`)
    item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })

  const detail = (entry: ResolvedEntry) =>
    entry.bilateral
      ? `${SIDE_LABEL.left} + ${SIDE_LABEL.right} · je ${formatDuration(entry.duration)}`
      : formatDuration(entry.duration)
</script>

<ol bind:this={list} class="flex flex-col gap-1.5">
  {#each entries as entry (entry.index)}
    {@const isCurrent = entry.index === current}
    <li data-index={entry.index}>
      <button
        type="button"
        class={[
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
          isCurrent ? 'bg-tint/10' : 'hover:bg-tint/5',
          entry.index < current && 'opacity-45',
        ]}
        onclick={() => onselect?.(entry.index)}
        aria-current={isCurrent ? 'step' : undefined}
      >
        <span
          class={[
            'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums',
            isCurrent ? 'bg-phase-work text-white' : 'bg-tint/8 text-muted',
          ]}>{entry.index + 1}</span
        >
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium">{entry.exercise.name}</span>
          <span class="block text-xs text-muted">{detail(entry)}</span>
        </span>
        <span class="text-sm text-muted tabular-nums">{formatDuration(entry.totalDuration)}</span>
      </button>
    </li>
  {/each}
</ol>
