<script lang="ts">
  import ExerciseDialog from '../components/ExerciseDialog.svelte'
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import { exerciseTotalDuration } from '../lib/model/plan'
  import type { Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'
  import { formatDuration } from '../lib/util/format'

  let editing = $state<Exercise | null | undefined>()
  let query = $state('')

  const filtered = $derived(
    library.exercises.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase())),
  )

  async function remove(exercise: Exercise) {
    const used = library.routinesUsing(exercise.id).map((r) => `„${r.name}“`)
    const message = used.length
      ? `„${exercise.name}“ wird in ${used.join(', ')} verwendet und dort ebenfalls entfernt. Trotzdem löschen?`
      : `„${exercise.name}“ löschen?`
    if (confirm(message)) await library.deleteExercise(exercise.id)
  }
</script>

<PageLayout title="Übungsbibliothek" back={{ name: 'home' }}>
  <div class="mb-5 flex items-end justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold">Übungen</h2>
      <p class="text-sm text-muted">Änderungen wirken sich auf alle Routinen aus.</p>
    </div>
    <button type="button" class="btn-primary" onclick={() => (editing = null)}>
      <Icon name="plus" class="size-4" /> Neu
    </button>
  </div>

  <input class="mb-4 field" type="search" placeholder="Suchen …" bind:value={query} />

  <ul class="flex flex-col gap-2">
    {#each filtered as exercise (exercise.id)}
      <li class="flex items-center gap-3 card p-3 pl-4">
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{exercise.name}</p>
          <p class="text-xs text-muted">
            {#if exercise.bilateral}
              beidseitig · je {formatDuration(exercise.duration)} · gesamt {formatDuration(
                exerciseTotalDuration(exercise, library.settings.defaultSwitchTime),
              )}
            {:else}
              {formatDuration(exercise.duration)}
            {/if}
          </p>
          {#if exercise.notes}
            <p class="mt-1 line-clamp-1 text-xs text-muted/80">{exercise.notes}</p>
          {/if}
        </div>
        <button
          type="button"
          class="icon-btn size-9"
          aria-label="{exercise.name} bearbeiten"
          onclick={() => (editing = exercise)}><Icon name="edit" class="size-5" /></button
        >
        <button
          type="button"
          class="icon-btn size-9 text-rose-300"
          aria-label="{exercise.name} löschen"
          onclick={() => remove(exercise)}><Icon name="trash" class="size-5" /></button
        >
      </li>
    {:else}
      <li class="py-8 text-center text-muted">Keine Übungen gefunden.</li>
    {/each}
  </ul>
</PageLayout>

<ExerciseDialog exercise={editing} onclose={() => (editing = undefined)} />
