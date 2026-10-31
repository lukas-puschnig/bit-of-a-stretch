<script lang="ts">
  import Menu from './components/Menu.svelte'
  import { router } from './lib/router.svelte'
  import { library } from './lib/stores/library.svelte'
  import { useTheme } from './lib/theme'
  import DataView from './views/DataView.svelte'
  import ExerciseLibrary from './views/ExerciseLibrary.svelte'
  import HomeView from './views/HomeView.svelte'
  import PlayerView from './views/PlayerView.svelte'
  import RoutineEditor from './views/RoutineEditor.svelte'

  const route = $derived(router.route)

  $effect(() => useTheme(library.settings.theme))
</script>

{#if !library.ready}
  <div class="grid h-dvh place-items-center text-muted">Lädt …</div>
{:else if route.name === 'play'}
  {@const routine = library.routine(route.routine)}
  {#if routine}
    {#key routine}
      <PlayerView {routine} />
    {/key}
  {:else}
    <HomeView />
  {/if}
{:else if route.name === 'edit-routine'}
  {#key route.routine}
    <RoutineEditor original={route.routine ? library.routine(route.routine) : undefined} />
  {/key}
{:else if route.name === 'exercises'}
  <ExerciseLibrary />
{:else if route.name === 'data'}
  <DataView />
{:else}
  <HomeView />
{/if}

<Menu />
