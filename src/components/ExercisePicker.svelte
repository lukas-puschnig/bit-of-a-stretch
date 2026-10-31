<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte'
  import type { Exercise } from '../lib/model/types'
  import { library } from '../lib/stores/library.svelte'
  import ExerciseBrowser from './ExerciseBrowser.svelte'
  import ExerciseDialog from './ExerciseDialog.svelte'
  import Icon from './Icon.svelte'

  interface Props {
    open: boolean
    onpick: (exercise: Exercise) => void
    onclose: () => void
  }

  let { open, onpick, onclose }: Props = $props()

  let dialog: HTMLDialogElement | undefined = $state()
  let added = $state<{ name: string; at: number }>()
  /** Name for the exercise being created; undefined while the dialog is closed. */
  let creating = $state<string>()

  $effect(() => {
    if (open && !dialog?.open) dialog?.showModal()
    if (!open && dialog?.open) dialog.close()
  })

  function pick(exercise: Exercise) {
    onpick(exercise)
    added = { name: exercise.name, at: Date.now() }
  }

  // Hide the confirmation shortly after the last pick.
  $effect(() => {
    if (!added) return
    const timer = setTimeout(() => (added = undefined), 1800)
    return () => clearTimeout(timer)
  })
</script>

<dialog
  bind:this={dialog}
  class="m-0 mx-auto h-dvh max-h-none w-full max-w-2xl bg-bg text-fg backdrop:bg-black/60 sm:my-[5vh] sm:h-[90vh] sm:rounded-2xl sm:border sm:border-line"
  {onclose}
  aria-label={t('picker.title')}
>
  <div class="flex h-full flex-col">
    <header class="flex h-14 shrink-0 items-center gap-2 border-b border-line/60 px-2">
      <button type="button" class="icon-btn" aria-label={t('common.close')} onclick={onclose}>
        <Icon name="close" />
      </button>
      <h2 class="flex-1 text-center text-sm font-semibold">{t('picker.title')}</h2>
      <button type="button" class="mr-1 btn-primary py-2" onclick={onclose}>
        {t('common.done')}
      </button>
    </header>
    <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
      <ExerciseBrowser
        exercises={library.exercises}
        onselect={pick}
        oncreate={(name) => (creating = name)}
      >
        {#snippet actions(exercise)}
          <button
            type="button"
            class="icon-btn size-10 bg-accent/12 text-accent"
            aria-label={t('picker.add', { name: exercise.name })}
            onclick={() => pick(exercise)}
          >
            <Icon name="plus" class="size-5" />
          </button>
        {/snippet}
      </ExerciseBrowser>
    </div>
  </div>
  {#if added}
    {#key added.at}
      <p
        class="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] mx-auto flex w-fit max-w-[90vw] items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-bg shadow-xl"
        role="status"
      >
        <Icon name="check" class="size-4" />
        <span class="truncate">{t('picker.added', { name: added.name })}</span>
      </p>
    {/key}
  {/if}
  <!-- Inside the picker so it stacks above it; a new exercise is added right away. -->
  <ExerciseDialog
    exercise={creating === undefined ? undefined : null}
    draftName={creating}
    onsave={pick}
    onclose={() => (creating = undefined)}
  />
</dialog>
