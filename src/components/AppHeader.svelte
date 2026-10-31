<script lang="ts">
  import type { Snippet } from 'svelte'
  import { t } from '../lib/i18n/i18n.svelte'
  import { ui } from '../lib/stores/ui.svelte'
  import Icon from './Icon.svelte'

  interface Props {
    title?: string
    /** Content for the left slot, e.g. the audio toggle or a back button. */
    start?: Snippet
  }

  let { title = '', start }: Props = $props()
</script>

<header class="flex h-14 shrink-0 items-center gap-2 px-2">
  <div class="flex w-11 justify-start">{@render start?.()}</div>
  <h1 class="min-w-0 flex-1 truncate text-center text-sm font-semibold text-muted">{title}</h1>
  <button
    type="button"
    class="icon-btn"
    aria-label={t('nav.open')}
    onclick={() => (ui.menuOpen = true)}
  >
    <Icon name="menu" />
  </button>
</header>
