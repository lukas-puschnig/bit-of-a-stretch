<script lang="ts">
  import type { Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'
  import { createId } from '../lib/util/format'
  import Icon from './Icon.svelte'
  import SecondsInput from './SecondsInput.svelte'

  interface Props {
    /** The exercise to edit, `null` for a new one, `undefined` when closed. */
    exercise: Exercise | null | undefined
    onclose: () => void
  }

  let { exercise, onclose }: Props = $props()

  let dialog: HTMLDialogElement | undefined = $state()
  let name = $state('')
  let notes = $state('')
  let image = $state('')
  let duration = $state<number | undefined>(60)
  let bilateral = $state(false)
  let switchTime = $state<number | undefined>()

  $effect(() => {
    if (exercise === undefined) {
      dialog?.close()
      return
    }
    name = exercise?.name ?? ''
    notes = exercise?.notes ?? ''
    image = exercise?.image ?? ''
    duration = exercise?.duration ?? 60
    bilateral = exercise?.bilateral ?? false
    switchTime = exercise?.switchTime
    dialog?.showModal()
  })

  async function save(event: SubmitEvent) {
    event.preventDefault()
    await library.saveExercise({
      id: exercise?.id ?? createId(name),
      name: name.trim(),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(image.trim() && { image: image.trim() }),
      duration: duration ?? 0,
      bilateral,
      ...(bilateral && switchTime !== undefined && { switchTime }),
    })
    onclose()
  }
</script>

<dialog
  bind:this={dialog}
  class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface text-fg shadow-2xl backdrop:bg-black/60"
  {onclose}
>
  <form class="flex flex-col gap-4 p-5" onsubmit={save}>
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">{exercise ? 'Übung bearbeiten' : 'Neue Übung'}</h2>
      <button type="button" class="-mr-2 icon-btn" aria-label="Schließen" onclick={onclose}>
        <Icon name="close" />
      </button>
    </div>

    <div>
      <label class="label" for="exercise-name">Name</label>
      <input id="exercise-name" class="field" bind:value={name} required maxlength="80" />
    </div>
    <div>
      <label class="label" for="exercise-notes">Hinweise (optional)</label>
      <textarea id="exercise-notes" class="field" rows="3" bind:value={notes}></textarea>
    </div>
    <div>
      <label class="label" for="exercise-image">Bild-URL (optional)</label>
      <input
        id="exercise-image"
        class="field"
        bind:value={image}
        placeholder="images/pancake.webp oder https://…"
      />
    </div>

    <label class="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3">
      <input type="checkbox" class="size-5 accent-accent" bind:checked={bilateral} />
      <span>
        <span class="block font-medium">Beidseitig</span>
        <span class="block text-xs text-muted">Links und rechts mit Seitenwechsel dazwischen</span>
      </span>
    </label>

    <div class="grid grid-cols-2 gap-3">
      <SecondsInput label={bilateral ? 'Dauer je Seite' : 'Dauer'} bind:value={duration} />
      {#if bilateral}
        <SecondsInput
          label="Seitenwechsel"
          optional
          placeholder={String(library.settings.defaultSwitchTime)}
          bind:value={switchTime}
        />
      {/if}
    </div>

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="btn-secondary" onclick={onclose}>Abbrechen</button>
      <button type="submit" class="btn-primary">Speichern</button>
    </div>
  </form>
</dialog>
