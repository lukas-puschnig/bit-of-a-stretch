<script lang="ts">
  import ExerciseBrowser from '../components/ExerciseBrowser.svelte'
  import ExerciseDialog from '../components/ExerciseDialog.svelte'
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import { t } from '../lib/i18n/i18n.svelte'
  import type { Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'

  let editing = $state<Exercise | null | undefined>()
  let draftName = $state<string>()

  async function remove(exercise: Exercise) {
    const used = library.routinesUsing(exercise.id).map((r) => `„${r.name}“`)
    const message = used.length
      ? t('library.confirmDeleteUsed', { name: exercise.name, routines: used.join(', ') })
      : t('library.confirmDelete', { name: exercise.name })
    if (confirm(message)) await library.deleteExercise(exercise.id)
  }
</script>

<PageLayout title={t('nav.exercises')} back={{ name: 'home' }}>
  <div class="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold">{t('library.title')}</h2>
      <p class="text-sm text-muted">{t('library.subtitle')}</p>
    </div>
    <button type="button" class="btn-primary" onclick={() => (editing = null)}>
      <Icon name="plus" class="size-4" />
      {t('common.new')}
    </button>
  </div>

  <ExerciseBrowser
    exercises={library.exercises}
    stickyClass="top-14"
    onselect={(e) => (editing = e)}
    oncreate={(name) => {
      draftName = name
      editing = null
    }}
  >
    {#snippet actions(exercise)}
      <button
        type="button"
        class="icon-btn size-9"
        aria-label={t('common.edit', { name: exercise.name })}
        onclick={() => (editing = exercise)}><Icon name="edit" class="size-5" /></button
      >
      <button
        type="button"
        class="icon-btn size-9 text-danger"
        aria-label={t('common.remove', { name: exercise.name })}
        onclick={() => remove(exercise)}><Icon name="trash" class="size-5" /></button
      >
    {/snippet}
  </ExerciseBrowser>
</PageLayout>

<ExerciseDialog
  exercise={editing}
  draftName={editing === null ? draftName : undefined}
  onclose={() => {
    editing = undefined
    draftName = undefined
  }}
/>
