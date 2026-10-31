<script lang="ts">
  import Menu from './components/Menu.svelte'
  import { i18n, t } from './lib/i18n/i18n.svelte'
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

  $effect(() => {
    // Until settings are loaded, the detected browser language applies.
    if (!library.ready) return
    i18n.locale = library.settings.language
    document.documentElement.lang = library.settings.language
  })
</script>

{#if !library.ready}
  <div class="grid h-dvh place-items-center text-muted">{t('app.loading')}</div>
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
