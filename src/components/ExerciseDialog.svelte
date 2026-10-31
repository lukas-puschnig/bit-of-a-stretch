<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte'
  import { CATEGORIES, TIMING, type Category, type Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'
  import { createId } from '../lib/util/format'
  import Icon from './Icon.svelte'
  import Stepper from './Stepper.svelte'

  interface Props {
    /** The exercise to edit, `null` for a new one, `undefined` when closed. */
    exercise: Exercise | null | undefined
    /** Prefills the name of a new exercise. */
    draftName?: string
    onclose: () => void
    onsave?: (exercise: Exercise) => void
  }

  let { exercise, draftName, onclose, onsave }: Props = $props()

  let dialog: HTMLDialogElement | undefined = $state()
  let name = $state('')
  let category = $state<Category | ''>('')
  let notes = $state('')
  let image = $state('')
  let duration = $state<number | undefined>(TIMING.duration.initial)
  let bilateral = $state(false)
  let switchTime = $state<number | undefined>()

  $effect(() => {
    if (exercise === undefined) {
      dialog?.close()
      return
    }
    name = exercise?.name ?? draftName ?? ''
    category = exercise?.category ?? ''
    notes = exercise?.notes ?? ''
    image = exercise?.image ?? ''
    duration = exercise?.duration ?? TIMING.duration.initial
    bilateral = exercise?.bilateral ?? false
    switchTime = exercise?.switchTime
    dialog?.showModal()
  })

  async function save(event: SubmitEvent) {
    event.preventDefault()
    const saved: Exercise = {
      id: exercise?.id ?? createId(name),
      name: name.trim(),
      ...(category && { category }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(image.trim() && { image: image.trim() }),
      duration: duration ?? TIMING.duration.initial,
      bilateral,
      ...(bilateral && switchTime !== undefined && { switchTime }),
    }
    await library.saveExercise(saved)
    onsave?.(saved)
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
      <h2 class="text-lg font-semibold">
        {exercise ? t('exercise.titleEdit') : t('exercise.titleNew')}
      </h2>
      <button type="button" class="-mr-2 icon-btn" aria-label={t('common.close')} onclick={onclose}>
        <Icon name="close" />
      </button>
    </div>

    <div>
      <label class="label" for="exercise-name">{t('exercise.name')}</label>
      <input id="exercise-name" class="field" bind:value={name} required maxlength="80" />
    </div>
    <div>
      <label class="label" for="exercise-category">{t('exercise.category')}</label>
      <select id="exercise-category" class="field" bind:value={category}>
        <option value="">{t('category.other')}</option>
        {#each CATEGORIES as option (option)}
          <option value={option}>{t(`category.${option}`)}</option>
        {/each}
      </select>
    </div>
    <div>
      <label class="label" for="exercise-notes">{t('exercise.notes')}</label>
      <textarea id="exercise-notes" class="field" rows="3" bind:value={notes}></textarea>
    </div>
    <div>
      <label class="label" for="exercise-image">{t('exercise.image')}</label>
      <input
        id="exercise-image"
        class="field"
        bind:value={image}
        placeholder={t('exercise.imagePlaceholder')}
      />
    </div>

    <label class="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3">
      <input type="checkbox" class="size-5 accent-accent" bind:checked={bilateral} />
      <span>
        <span class="block font-medium">{t('exercise.bilateral')}</span>
        <span class="block text-xs text-muted">{t('exercise.bilateralHint')}</span>
      </span>
    </label>

    <div class="grid grid-cols-2 gap-3">
      <Stepper
        label={bilateral ? t('exercise.durationPerSide') : t('exercise.duration')}
        step={TIMING.duration.step}
        min={TIMING.duration.step}
        bind:value={duration}
      />
      {#if bilateral}
        <Stepper
          label={t('exercise.switch')}
          step={TIMING.switch.step}
          fallback={library.settings.defaultSwitchTime}
          bind:value={switchTime}
        />
      {/if}
    </div>

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="btn-secondary" onclick={onclose}>{t('common.cancel')}</button>
      <button type="submit" class="btn-primary">{t('common.save')}</button>
    </div>
  </form>
</dialog>
