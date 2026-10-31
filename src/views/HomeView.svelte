<script lang="ts">
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import { buildPlan } from '../lib/model/plan'
  import { href } from '../lib/router.svelte'
  import { library } from '../lib/stores/library.svelte'
  import { formatClock } from '../lib/util/format'

  const summaries = $derived(
    library.routines.map((routine) => ({
      routine,
      plan: buildPlan(routine, library.exerciseById, library.settings.defaultSwitchTime),
    })),
  )
</script>

<PageLayout title="Routinen">
  <div class="mb-5 flex items-end justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold">Routinen</h2>
      <p class="text-sm text-muted">Wähle eine Routine und leg los.</p>
    </div>
    <a class="btn-secondary" href={href({ name: 'edit-routine' })}>
      <Icon name="plus" class="size-4" /> Neu
    </a>
  </div>

  {#if summaries.length === 0}
    <div class="card p-8 text-center text-muted">
      <p>Noch keine Routinen vorhanden.</p>
      <a class="mt-4 btn-primary" href={href({ name: 'edit-routine' })}>Erste Routine anlegen</a>
    </div>
  {:else}
    <ul class="grid gap-3 sm:grid-cols-2">
      {#each summaries as { routine, plan } (routine.name)}
        <li class="flex flex-col card p-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold">{routine.name}</h3>
            {#if routine.description}
              <p class="mt-1 line-clamp-2 text-sm text-muted">{routine.description}</p>
            {/if}
            <p class="mt-3 text-xs font-medium tracking-wide text-muted uppercase">
              {plan.entries.length} Übungen · {formatClock(plan.totalDuration)} min
            </p>
          </div>
          <div class="mt-4 flex gap-2">
            <a class="btn-primary flex-1" href={href({ name: 'play', routine: routine.name })}>
              <Icon name="play" filled class="size-4" /> Starten
            </a>
            <a
              class="btn-secondary"
              href={href({ name: 'edit-routine', routine: routine.name })}
              aria-label="{routine.name} bearbeiten"
            >
              <Icon name="edit" class="size-4" />
            </a>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  <p class="mt-8 flex items-start gap-2 text-xs text-muted">
    <Icon name="info" class="mt-px size-4 shrink-0" />
    <span>
      Deine Daten liegen nur in diesem Browser auf diesem Gerät.
      <a class="underline hover:text-fg" href={href({ name: 'data' })}>Backup exportieren</a>
    </span>
  </p>
</PageLayout>
