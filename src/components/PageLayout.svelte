<script lang="ts">
  import type { Snippet } from 'svelte'
  import { href, type Route } from '../lib/router.svelte'
  import AppHeader from './AppHeader.svelte'
  import Icon from './Icon.svelte'

  interface Props {
    title: string
    back?: Route
    children: Snippet
  }

  let { title, back, children }: Props = $props()
</script>

<div class="min-h-dvh">
  <div class="sticky top-0 z-10 border-b border-line/60 bg-bg/85 backdrop-blur">
    <div class="mx-auto max-w-3xl">
      <AppHeader {title}>
        {#snippet start()}
          {#if back}
            <a class="icon-btn" href={href(back)} aria-label="Zurück">
              <Icon name="back" />
            </a>
          {/if}
        {/snippet}
      </AppHeader>
    </div>
  </div>
  <main class="mx-auto max-w-3xl px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
    {@render children()}
  </main>
</div>
