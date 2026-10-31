<script lang="ts">
  import { LOCALES, type Locale } from '../lib/i18n/translate'
  import { router } from '../lib/router.svelte'
  import { library } from '../lib/stores/library.svelte'
  import Flag from './Flag.svelte'

  interface Props {
    /** Compact shows only flag and code, e.g. in the menu. */
    compact?: boolean
  }

  let { compact = false }: Props = $props()

  const NAMES: Record<Locale, string> = { de: 'Deutsch', en: 'English' }

  async function select(locale: Locale) {
    const renamed = await library.setLanguage(locale)
    // Keep the open routine on screen if its sample name was translated.
    const route = router.route
    if ((route.name === 'play' || route.name === 'edit-routine') && route.routine) {
      const name = renamed.get(route.routine)
      if (name) router.go({ ...route, routine: name }, { replace: true })
    }
  }
</script>

<div class="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1" role="radiogroup">
  {#each LOCALES as locale (locale)}
    {@const active = library.settings.language === locale}
    <button
      type="button"
      role="radio"
      aria-checked={active}
      lang={locale}
      class={[
        'flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
        active ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
      ]}
      onclick={() => select(locale)}
    >
      <Flag {locale} />
      {compact ? locale.toUpperCase() : NAMES[locale]}
    </button>
  {/each}
</div>
