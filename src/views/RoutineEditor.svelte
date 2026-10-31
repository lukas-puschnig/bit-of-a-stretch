<script lang="ts">
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import SecondsInput from '../components/SecondsInput.svelte'
  import { buildPlan, resolveEntry } from '../lib/model/plan'
  import type { Routine, RoutineEntry } from '../lib/model/types'
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
  let prepTime = $state<number | undefined>(initial?.prepTime ?? 10)
  let restTime = $state<number | undefined>(initial?.restTime ?? 15)
  let entries = $state<EditableEntry[]>(initial?.entries.map(withKey) ?? [])
  let picker = $state('')
  let error = $state<string>()

  const routine = $derived<Routine>({
    name: name.trim(),
    description: description.trim() || undefined,
    prepTime: prepTime ?? 0,
    restTime: restTime ?? 0,
    entries: entries.map(({ key: _key, ...entry }) => entry),
  })
  const plan = $derived(
    buildPlan(routine, library.exerciseById, library.settings.defaultSwitchTime),
  )

  function move(index: number, by: number) {
    const target = index + by
    if (target < 0 || target >= entries.length) return
    const copy = [...entries]
    ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
    entries = copy
  }

  function add() {
    if (!picker) return
    entries.push(withKey({ exerciseId: picker }))
    picker = ''
  }

  async function save(event: SubmitEvent) {
    event.preventDefault()
    if (!routine.name) return (error = 'Bitte einen Namen eingeben.')
    const clash = library.routine(routine.name)
    if (clash && routine.name !== original?.name) {
      return (error = `Eine Routine „${routine.name}“ gibt es schon.`)
    }
    await library.saveRoutine(routine, original?.name)
    router.go({ name: 'home' })
  }

  async function remove() {
    if (!original || !confirm(`Routine „${original.name}“ löschen?`)) return
    await library.deleteRoutine(original.name)
    router.go({ name: 'home' })
  }
</script>

<PageLayout title={original ? 'Routine bearbeiten' : 'Neue Routine'} back={{ name: 'home' }}>
  <form class="flex flex-col gap-6" onsubmit={save}>
    <section class="grid gap-4 card p-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="label" for="routine-name">Name</label>
        <input id="routine-name" class="field" bind:value={name} required maxlength="80" />
      </div>
      <div class="sm:col-span-2">
        <label class="label" for="routine-description">Beschreibung (optional)</label>
        <textarea id="routine-description" class="field" rows="2" bind:value={description}
        ></textarea>
      </div>
      <SecondsInput label="Vorbereitung" bind:value={prepTime} />
      <SecondsInput label="Pause nach jeder Übung" bind:value={restTime} />
    </section>

    <section>
      <div class="mb-3 flex items-baseline justify-between">
        <h2 class="text-lg font-semibold">Übungen</h2>
        <span class="text-sm text-muted tabular-nums">
          {plan.entries.length} · {formatClock(plan.totalDuration)} min
        </span>
      </div>

      <ol class="flex flex-col gap-2">
        {#each entries as entry, i (entry.key)}
          {@const exercise = library.exerciseById.get(entry.exerciseId)}
          {@const resolved =
            exercise &&
            resolveEntry(entry, exercise, routine, library.settings.defaultSwitchTime, i)}
          <li class="card p-3">
            <div class="flex items-center gap-2">
              <span
                class="grid size-7 shrink-0 place-items-center rounded-full bg-tint/8 text-xs font-semibold text-muted"
                >{i + 1}</span
              >
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">
                  {exercise?.name ?? `Fehlende Übung (${entry.exerciseId})`}
                </p>
                {#if resolved}
                  <p class="text-xs text-muted">
                    {resolved.bilateral ? 'beidseitig · ' : ''}{formatDuration(
                      resolved.totalDuration,
                    )}
                  </p>
                {/if}
              </div>
              <button
                type="button"
                class="icon-btn size-9"
                aria-label="Nach oben"
                disabled={i === 0}
                onclick={() => move(i, -1)}><Icon name="up" class="size-5" /></button
              >
              <button
                type="button"
                class="icon-btn size-9"
                aria-label="Nach unten"
                disabled={i === entries.length - 1}
                onclick={() => move(i, 1)}><Icon name="down" class="size-5" /></button
              >
              <button
                type="button"
                class="icon-btn size-9 text-danger"
                aria-label="Entfernen"
                onclick={() => entries.splice(i, 1)}><Icon name="trash" class="size-5" /></button
              >
            </div>
            {#if exercise}
              <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SecondsInput
                  label={exercise.bilateral ? 'Dauer je Seite' : 'Dauer'}
                  optional
                  placeholder={String(exercise.duration)}
                  bind:value={entry.duration}
                />
                <SecondsInput
                  label="Pause danach"
                  optional
                  placeholder={String(restTime ?? 0)}
                  bind:value={entry.restAfter}
                />
                {#if exercise.bilateral}
                  <SecondsInput
                    label="Seitenwechsel"
                    optional
                    placeholder={String(exercise.switchTime ?? library.settings.defaultSwitchTime)}
                    bind:value={entry.switchTime}
                  />
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ol>

      <div class="mt-3 flex gap-2">
        <select class="field flex-1" bind:value={picker} aria-label="Übung auswählen">
          <option value="">Übung hinzufügen …</option>
          {#each library.exercises as exercise (exercise.id)}
            <option value={exercise.id}>{exercise.name}</option>
          {/each}
        </select>
        <button type="button" class="btn-secondary" disabled={!picker} onclick={add}>
          <Icon name="plus" class="size-4" /> Hinzufügen
        </button>
      </div>
      <p class="mt-2 text-xs text-muted">
        Leere Felder übernehmen die Werte aus der Übung bzw. der Routine.
      </p>
    </section>

    {#if error}
      <p class="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>
    {/if}

    <div class="flex flex-wrap gap-2">
      <button type="submit" class="btn-primary">Speichern</button>
      <a class="btn-secondary" href="#/">Abbrechen</a>
      {#if original}
        <button type="button" class="ml-auto btn-danger" onclick={remove}>
          <Icon name="trash" class="size-4" /> Löschen
        </button>
      {/if}
    </div>
  </form>
</PageLayout>
