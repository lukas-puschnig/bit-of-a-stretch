<script lang="ts">
  import { onDestroy } from 'svelte'
  import AppHeader from '../components/AppHeader.svelte'
  import Controls from '../components/Controls.svelte'
  import EntryList from '../components/EntryList.svelte'
  import Icon from '../components/Icon.svelte'
  import ProgressBar from '../components/ProgressBar.svelte'
  import Timeline from '../components/Timeline.svelte'
  import TimerRing from '../components/TimerRing.svelte'
  import { Beeper } from '../lib/audio/beeper'
  import { buildPlan } from '../lib/model/plan'
  import { PHASE_COLOR, PHASE_LABEL, SIDE_LABEL } from '../lib/model/phaseStyle'
  import type { Routine } from '../lib/model/types'
  import { router } from '../lib/router.svelte'
  import { library } from '../lib/stores/library.svelte'
  import { Player } from '../lib/timer/player.svelte'
  import { ScreenWakeLock } from '../lib/timer/wakeLock'
  import { formatClock, formatCountdown, formatDuration } from '../lib/util/format'

  interface Props {
    routine: Routine
  }

  let { routine }: Props = $props()

  const beeper = new Beeper()
  const wakeLock = new ScreenWakeLock()

  // The plan is fixed for the lifetime of this view; App re-creates the view per routine.
  // svelte-ignore state_referenced_locally
  const player = new Player(
    buildPlan(routine, library.exerciseById, library.settings.defaultSwitchTime),
    (event, phase) => {
      if (!library.settings.audioEnabled) return
      if (event.type === 'countdown') beeper.countdown()
      else if (event.type === 'finished') beeper.finished()
      else if (phase) beeper.phaseStart(phase.kind)
    },
  )
  const plan = player.plan

  $effect(() => {
    if (player.running) void wakeLock.enable()
    else void wakeLock.disable()
  })

  onDestroy(() => {
    player.destroy()
    void wakeLock.destroy()
  })

  const finished = $derived(player.state.status === 'finished')
  const phase = $derived(player.phase)
  const entry = $derived(player.entry)
  const color = $derived(phase ? PHASE_COLOR[phase.kind] : PHASE_COLOR.prep)
  const remainingSeconds = $derived(Math.ceil(player.remainingMs / 1000))
  const progress = $derived(phase ? 1 - player.remainingMs / (phase.duration * 1000) : 0)
  // During prep and rest the entry is the one coming up next.
  const upcoming = $derived(phase?.kind === 'prep' || phase?.kind === 'rest')
  /** Everything but the timeline stays in a readable column; the timeline spans the screen. */
  const narrow = 'mx-auto w-full max-w-xl px-4 wide:max-w-2xl'
  const imageUrl = $derived(resolveImage(entry?.exercise.image))

  function resolveImage(path: string | undefined) {
    if (!path) return undefined
    return /^(https?:|data:|blob:|\/)/.test(path) ? path : import.meta.env.BASE_URL + path
  }

  function toggle() {
    beeper.unlock()
    player.toggle()
  }

  function selectEntry(index: number) {
    beeper.unlock()
    player.jumpToEntry(index)
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement)
      return
    if (event.key === ' ') {
      event.preventDefault()
      toggle()
    } else if (event.key === 'ArrowRight') player.next()
    else if (event.key === 'ArrowLeft') player.previous()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="relative flex h-dvh overflow-hidden">
  <!-- Phase tint, readable from across the room. -->
  <div
    class="pointer-events-none absolute inset-0 transition-colors duration-500"
    style="background: radial-gradient(120% 70% at 50% 35%, color-mix(in oklab, {color} 22%, transparent), transparent 70%)"
  ></div>

  <aside
    class="relative hidden w-80 shrink-0 flex-col border-r border-line/60 bg-surface/60 lg:w-96 wide:flex"
  >
    <div class="px-5 pt-5 pb-3">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">Routine</p>
      <h2 class="truncate text-lg font-semibold">{routine.name}</h2>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      <EntryList entries={plan.entries} current={entry?.index ?? 0} onselect={selectEntry} />
    </div>
  </aside>

  <main class="relative flex min-w-0 flex-1 flex-col pb-[max(1rem,env(safe-area-inset-bottom))]">
    <AppHeader title={routine.name}>
      {#snippet start()}
        <button
          type="button"
          class="icon-btn"
          aria-label={library.settings.audioEnabled ? 'Ton ausschalten' : 'Ton einschalten'}
          aria-pressed={library.settings.audioEnabled}
          onclick={() => {
            beeper.unlock()
            void library.updateSettings({ audioEnabled: !library.settings.audioEnabled })
          }}
        >
          <Icon name={library.settings.audioEnabled ? 'volume' : 'mute'} />
        </button>
      {/snippet}
    </AppHeader>

    {#if plan.phases.length === 0}
      <div class="grid flex-1 place-items-center p-6 text-center text-muted">
        <div>
          <p>Diese Routine enthält keine abspielbaren Übungen.</p>
          <button
            class="mt-4 btn-primary"
            onclick={() => router.go({ name: 'edit-routine', routine: routine.name })}
            >Routine bearbeiten</button
          >
        </div>
      </div>
    {:else}
      <div class="flex min-h-0 flex-1 flex-col gap-3">
        {#if plan.missingExerciseIds.length > 0}
          <p class="{narrow} rounded-lg bg-amber-500/10 py-2 text-xs text-amber-300">
            {plan.missingExerciseIds.length} Übung(en) fehlen in der Bibliothek und werden übersprungen.
          </p>
        {/if}

        <div class={narrow}>
          <ProgressBar elapsedSeconds={player.elapsedMs / 1000} totalSeconds={plan.totalDuration} />
        </div>

        <div class="{narrow} min-h-40 flex-[1_1_0]">
          <TimerRing
            {progress}
            {color}
            image={imageUrl}
            digits={finished ? '✓' : formatCountdown(remainingSeconds)}
            label={finished ? 'Fertig' : phase ? PHASE_LABEL[phase.kind] : ''}
            paused={player.state.status === 'paused'}
            ontoggle={toggle}
          />
        </div>

        <section class="{narrow} shrink-0 text-center" aria-live="polite">
          {#if finished}
            <p class="text-3xl font-bold">Geschafft!</p>
            <p class="mt-1 text-muted">
              {formatClock(plan.totalDuration)} · {plan.entries.length} Übungen
            </p>
          {:else if entry && phase}
            <p class="text-xs font-medium tracking-wide text-muted uppercase">
              {upcoming ? 'Als Nächstes' : ''}
              {upcoming ? '·' : ''}
              {entry.index + 1} von {plan.entries.length}
            </p>
            <p class="mt-1 text-2xl leading-tight font-bold text-balance sm:text-3xl">
              {entry.exercise.name}
            </p>
            {#if phase.side && !upcoming}
              <p
                class="mt-1 text-3xl font-extrabold tracking-wide uppercase transition-colors"
                style="color: {color}"
              >
                {phase.kind === 'switch' ? `→ ${SIDE_LABEL[phase.side]}` : SIDE_LABEL[phase.side]}
              </p>
            {/if}
            <p class="mt-1 text-sm text-muted">
              {entry.bilateral ? 'je Seite ' : ''}{formatDuration(entry.duration)}
            </p>
          {/if}
        </section>

        <Timeline
          phases={plan.phases}
          totalSeconds={plan.totalDuration}
          elapsedSeconds={player.elapsedMs / 1000}
        />

        <div class="{narrow} max-h-44 min-h-14 flex-[0_1_auto] overflow-y-auto px-2 wide:hidden">
          {#if entry && entry.index + 1 < plan.entries.length}
            <EntryList
              entries={plan.entries.slice(entry.index + 1)}
              current={-1}
              onselect={selectEntry}
            />
          {/if}
        </div>

        <div class={narrow}>
          <Controls
            running={player.running}
            {color}
            onprevious={() => player.previous()}
            ontoggle={toggle}
            onnext={() => player.next()}
          />
        </div>
      </div>
    {/if}
  </main>
</div>
