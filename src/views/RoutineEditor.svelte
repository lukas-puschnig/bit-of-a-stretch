<script lang="ts">
  import type { Snippet } from 'svelte'
  import ExercisePicker from '../components/ExercisePicker.svelte'
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import Stepper from '../components/Stepper.svelte'
  import { t, tc } from '../lib/i18n/i18n.svelte'
  import { buildPlan, resolveEntry } from '../lib/model/plan'
  import { TIMING, type Routine, type RoutineEntry } from '../lib/model/types'
  import { router } from '../lib/router.svelte'
  import { library } from '../lib/stores/library.svelte'
  import { formatClock, formatDuration } from '../lib/util/format'

  interface Props {
    /** Undefined when creating a new routine. */
    original?: Routine
  }

  let { original }: Props = $props()

  /** Entries get a local key so Svelte can track them while reordering. */
  type EditableEntry = RoutineEntry & { key: number }
  let nextKey = 0
  const withKey = (entry: RoutineEntry): EditableEntry => ({ ...entry, key: nextKey++ })

  // Editing works on a copy; the library only changes on save.
  // svelte-ignore state_referenced_locally
  const initial = original
  let name = $state(initial?.name ?? '')
  let description = $state(initial?.description ?? '')
  let prepTime = $state<number | undefined>(initial?.prepTime ?? TIMING.prep.initial)
  let restTime = $state<number | undefined>(initial?.restTime ?? TIMING.rest.initial)
  let entries = $state<EditableEntry[]>(initial?.entries.map(withKey) ?? [])
  let pickerOpen = $state(false)
  let error = $state<string>()

  const routine = $derived<Routine>({
    name: name.trim(),
    description: description.trim() || undefined,
    prepTime: prepTime ?? 0,
    restTime: restTime ?? 0,
    entries: entries.map(({ key: _key, ...entry }) => entry),
  })
  const switchDefault = $derived(library.settings.defaultSwitchTime)
  const plan = $derived(buildPlan(routine, library.exerciseById, switchDefault))

  /** When each playable entry starts, keyed by its position among playable entries. */
  const startTimes = $derived(
    plan.phases.reduce((starts, phase) => {
      if (phase.kind === 'work' && !starts.has(phase.entryIndex)) {
        starts.set(phase.entryIndex, phase.start)
      }
      return starts
    }, new Map<number, number>()),
  )

  // Plan entries skip missing exercises, so map editor rows to plan positions.
  const planIndex = $derived.by(() => {
    let next = 0
    return entries.map((e) => (library.exerciseById.has(e.exerciseId) ? next++ : undefined))
  })

  function move(index: number, by: number) {
    const target = index + by
    if (target < 0 || target >= entries.length) return
    const copy = [...entries]
    ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
    entries = copy
  }

  async function save(event: SubmitEvent) {
    event.preventDefault()
    if (!routine.name) return (error = t('editor.errorName'))
    const clash = library.routine(routine.name)
    if (clash && routine.name !== original?.name) {
      return (error = t('editor.errorDuplicate', { name: routine.name }))
    }
    await library.saveRoutine(routine, original?.name)
    router.go({ name: 'home' })
  }

  async function remove() {
    if (!original || !confirm(t('editor.confirmDelete', { name: original.name }))) return
    await library.deleteRoutine(original.name)
    router.go({ name: 'home' })
  }
</script>

{#snippet connector()}
  <div class="mx-auto h-3 w-px bg-line" aria-hidden="true"></div>
{/snippet}

{#snippet slim(label: string, content: Snippet)}
  <div
    class="mx-auto flex w-full max-w-60 items-center gap-2 rounded-xl border border-dashed border-line py-1 pr-1 pl-3 text-xs text-muted"
  >
    <span class="flex-1 font-medium">{label}</span>
    {@render content()}
  </div>
{/snippet}

<PageLayout title={original ? t('editor.titleEdit') : t('editor.titleNew')} back={{ name: 'home' }}>
  <form class="flex flex-col gap-6" onsubmit={save}>
    <section class="grid gap-4 card p-4">
      <div>
        <label class="label" for="routine-name">{t('editor.name')}</label>
        <input id="routine-name" class="field" bind:value={name} required maxlength="80" />
      </div>
      <div>
        <label class="label" for="routine-description">{t('editor.description')}</label>
        <textarea id="routine-description" class="field" rows="2" bind:value={description}
        ></textarea>
      </div>
      <div class="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[12rem_1fr]">
        <Stepper label={t('editor.defaultRest')} step={TIMING.rest.step} bind:value={restTime} />
        <p class="text-xs text-muted sm:pt-5">{t('editor.defaultRestHint')}</p>
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-baseline justify-between">
        <h2 class="text-lg font-semibold">{t('editor.sequence')}</h2>
        <span class="text-sm text-muted tabular-nums">
          {tc('count.exercises', plan.entries.length)} · {formatClock(plan.totalDuration)} min
        </span>
      </div>

      <ol class="flex flex-col">
        <li>
          {#snippet prepStepper()}
            <div class="w-32">
              <Stepper
                label={t('phase.prep')}
                hideLabel
                size="sm"
                step={TIMING.prep.step}
                bind:value={prepTime}
              />
            </div>
          {/snippet}
          {@render slim(t('editor.start'), prepStepper)}
        </li>

        {#each entries as entry, i (entry.key)}
          {@const exercise = library.exerciseById.get(entry.exerciseId)}
          {@const resolved = exercise && resolveEntry(entry, exercise, routine, switchDefault, i)}
          {@const start = startTimes.get(planIndex[i] ?? -1)}
          <li>
            {@render connector()}
            <article class="card p-3 shadow-sm">
              <div class="flex items-center gap-2">
                <span
                  class="grid size-8 shrink-0 place-items-center rounded-full bg-phase-work/15 text-sm font-semibold text-phase-work"
                  >{i + 1}</span
                >
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold">
                    {exercise?.name ?? t('editor.missingExercise', { id: entry.exerciseId })}
                  </p>
                  {#if resolved}
                    <p class="text-xs text-muted tabular-nums">
                      {#if start !== undefined}{formatClock(start)} ·{/if}
                      {resolved.bilateral ? `${t('editor.bothSides')} · ` : ''}{formatDuration(
                        resolved.totalDuration,
                      )}
                    </p>
                  {/if}
                </div>
                <button
                  type="button"
                  class="icon-btn size-9"
                  aria-label={t('editor.moveUp')}
                  disabled={i === 0}
                  onclick={() => move(i, -1)}><Icon name="up" class="size-5" /></button
                >
                <button
                  type="button"
                  class="icon-btn size-9"
                  aria-label={t('editor.moveDown')}
                  disabled={i === entries.length - 1}
                  onclick={() => move(i, 1)}><Icon name="down" class="size-5" /></button
                >
                <button
                  type="button"
                  class="icon-btn size-9 text-danger"
                  aria-label={t('editor.removeEntry')}
                  onclick={() => entries.splice(i, 1)}><Icon name="trash" class="size-5" /></button
                >
              </div>
              {#if exercise}
                <div class="mt-3 grid grid-cols-2 gap-3">
                  <Stepper
                    label={exercise.bilateral ? t('editor.durationPerSide') : t('editor.duration')}
                    step={TIMING.duration.step}
                    min={TIMING.duration.step}
                    fallback={exercise.duration}
                    bind:value={entry.duration}
                  />
                  {#if exercise.bilateral}
                    <Stepper
                      label={t('editor.switch')}
                      step={TIMING.switch.step}
                      fallback={exercise.switchTime ?? switchDefault}
                      bind:value={entry.switchTime}
                    />
                  {/if}
                </div>
              {/if}
            </article>
          </li>

          {#if i < entries.length - 1}
            <li>
              {@render connector()}
              {#snippet restStepper()}
                <div class="w-32">
                  <Stepper
                    label={t('editor.rest')}
                    hideLabel
                    size="sm"
                    step={TIMING.rest.step}
                    fallback={restTime ?? 0}
                    bind:value={entry.restAfter}
                  />
                </div>
              {/snippet}
              {@render slim(t('editor.rest'), restStepper)}
            </li>
          {/if}
        {:else}
          <li>
            {@render connector()}
            <p class="card p-6 text-center text-sm text-muted">{t('editor.empty')}</p>
          </li>
        {/each}

        <li>
          {@render connector()}
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-4 font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            onclick={() => (pickerOpen = true)}
          >
            <Icon name="plus" class="size-5" />
            {t('editor.addExercise')}
          </button>
        </li>

        {#if entries.length > 0}
          <li>
            {@render connector()}
            {#snippet total()}
              <span class="py-1.5 pr-2 font-medium tabular-nums"
                >{formatClock(plan.totalDuration)} min</span
              >
            {/snippet}
            {@render slim(t('editor.end'), total)}
          </li>
        {/if}
      </ol>
    </section>

    {#if error}
      <p class="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>
    {/if}

    <div
      class="sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t border-line/60 bg-bg/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <button type="submit" class="btn-primary">{t('common.save')}</button>
      <a class="btn-secondary" href="#/">{t('common.cancel')}</a>
      {#if original}
        <button type="button" class="ml-auto btn-danger" onclick={remove}>
          <Icon name="trash" class="size-4" />
          {t('common.delete')}
        </button>
      {/if}
    </div>
  </form>
</PageLayout>

<ExercisePicker
  open={pickerOpen}
  onpick={(exercise) => entries.push(withKey({ exerciseId: exercise.id }))}
  onclose={() => (pickerOpen = false)}
/>
