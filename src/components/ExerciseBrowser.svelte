<script lang="ts" module>
  import type { Category } from '../lib/model/types'

  export type CategoryFilter = Category | 'other' | 'all'
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { t } from '../lib/i18n/i18n.svelte'
  import { exerciseImage } from '../lib/images'
  import { exerciseTotalDuration } from '../lib/model/plan'
  import { CATEGORIES, type Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'
  import { formatDuration } from '../lib/util/format'
  import Icon from './Icon.svelte'

  interface Props {
    exercises: Exercise[]
    /** Trailing content per row, e.g. edit and delete buttons. */
    actions?: Snippet<[Exercise]>
    /** Makes the whole row a button. */
    onselect?: (exercise: Exercise) => void
    /** Classes for the sticky search bar, so it sits below the surrounding header. */
    stickyClass?: string
  }

  let { exercises, actions, onselect, stickyClass = 'top-0' }: Props = $props()

  let query = $state('')
  let filter = $state<CategoryFilter>('all')

  const groupOf = (e: Exercise): Category | 'other' => e.category ?? 'other'
  const ORDER: (Category | 'other')[] = [...CATEGORIES, 'other']
  const FILTERS: CategoryFilter[] = ['all', ...ORDER]

  const matches = $derived.by(() => {
    const q = query.trim().toLocaleLowerCase()
    if (!q) return exercises
    return exercises.filter((e) =>
      `${e.name} ${e.notes ?? ''} ${t(`category.${groupOf(e)}`)}`.toLocaleLowerCase().includes(q),
    )
  })

  // Chips reflect the search, so they never offer an empty category.
  const counts = $derived(
    matches.reduce((map, e) => map.set(groupOf(e), (map.get(groupOf(e)) ?? 0) + 1), new Map()),
  )

  const groups = $derived(
    ORDER.filter((c) => filter === 'all' || filter === c)
      .map((category) => ({ category, items: matches.filter((e) => groupOf(e) === category) }))
      .filter((g) => g.items.length > 0),
  )

  const detail = (e: Exercise) =>
    e.bilateral
      ? t('library.bilateralDetail', {
          duration: formatDuration(e.duration),
          total: formatDuration(exerciseTotalDuration(e, library.settings.defaultSwitchTime)),
        })
      : formatDuration(e.duration)
</script>

<div class="sticky z-10 -mx-4 bg-bg/90 px-4 pt-1 pb-3 backdrop-blur {stickyClass}">
  <label class="relative block">
    <span class="sr-only">{t('library.search')}</span>
    <Icon name="search" class="pointer-events-none absolute top-3 left-3 size-5 text-muted" />
    <input class="field pl-10" type="search" placeholder={t('library.search')} bind:value={query} />
  </label>
  <div
    class="-mx-4 mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4"
    role="group"
    aria-label={t('library.filter')}
  >
    {#each FILTERS as option (option)}
      {@const count = option === 'all' ? matches.length : (counts.get(option) ?? 0)}
      {#if option === 'all' || count > 0}
        <button
          type="button"
          class={[
            'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
            filter === option
              ? 'border-transparent bg-fg text-bg'
              : 'border-line text-muted hover:border-muted hover:text-fg',
          ]}
          aria-pressed={filter === option}
          onclick={() => (filter = option)}
        >
          {option === 'all' ? t('library.all') : t(`category.${option}`)}
          <span class="ml-1 tabular-nums opacity-60">{count}</span>
        </button>
      {/if}
    {/each}
  </div>
</div>

{#each groups as group (group.category)}
  <section class="mt-4 first-of-type:mt-1">
    <h3 class="mb-2 px-1 text-xs font-semibold tracking-wide text-muted uppercase">
      {t(`category.${group.category}`)}
    </h3>
    <ul class="flex flex-col gap-2">
      {#each group.items as exercise (exercise.id)}
        {@const image = exerciseImage(exercise)}
        <li class="flex items-center gap-3 card p-3">
          <svelte:element
            this={onselect ? 'button' : 'div'}
            type={onselect ? 'button' : undefined}
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            onclick={onselect ? () => onselect(exercise) : undefined}
            role={onselect ? undefined : 'presentation'}
          >
            {#if image}
              <img
                src={image}
                alt=""
                class="size-12 shrink-0 rounded-xl bg-surface-2 object-cover"
              />
            {/if}
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium">{exercise.name}</span>
              <span class="block text-xs text-muted">{detail(exercise)}</span>
              {#if exercise.notes}
                <span class="mt-1 line-clamp-1 block text-xs text-muted/80">{exercise.notes}</span>
              {/if}
            </span>
          </svelte:element>
          {@render actions?.(exercise)}
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p class="py-8 text-center text-muted">{t('library.empty')}</p>
{/each}
