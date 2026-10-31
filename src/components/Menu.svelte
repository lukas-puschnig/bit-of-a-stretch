<script lang="ts">
  import type { MessageKey } from '../lib/i18n/messages'
  import { t } from '../lib/i18n/i18n.svelte'
  import { href, router, type Route } from '../lib/router.svelte'
  import { library } from '../lib/stores/library.svelte'
  import { ui } from '../lib/stores/ui.svelte'
  import Icon, { type IconName } from './Icon.svelte'
  import LanguageSwitch from './LanguageSwitch.svelte'

  let dialog: HTMLDialogElement | undefined = $state()

  $effect(() => {
    if (!dialog) return
    if (ui.menuOpen && !dialog.open) dialog.showModal()
    else if (!ui.menuOpen && dialog.open) dialog.close()
  })

  const playing = $derived(router.route.name === 'play' ? router.route.routine : undefined)

  const links: { route: Route; label: MessageKey; icon: IconName }[] = [
    { route: { name: 'home' }, label: 'nav.routines', icon: 'list' },
    { route: { name: 'exercises' }, label: 'nav.exercises', icon: 'dumbbell' },
    { route: { name: 'data' }, label: 'nav.data', icon: 'database' },
  ]

  function close() {
    ui.menuOpen = false
  }
</script>

<dialog
  bind:this={dialog}
  class="menu m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-surface text-fg shadow-2xl backdrop:bg-black/60"
  onclose={close}
  onclick={(e) => e.target === dialog && close()}
>
  <nav class="flex h-full flex-col gap-6 overflow-y-auto p-4" aria-label={t('nav.label')}>
    <div class="flex items-center justify-between pl-2">
      <span class="font-semibold">Bit of a Stretch</span>
      <button type="button" class="icon-btn" aria-label={t('nav.close')} onclick={close}>
        <Icon name="close" />
      </button>
    </div>

    {#if playing}
      <div class="flex flex-col gap-2">
        <a class="btn-danger justify-start" href={href({ name: 'home' })} onclick={close}>
          <Icon name="back" class="size-5" />
          {t('nav.leaveRoutine')}
        </a>
        <a
          class="btn-secondary justify-start"
          href={href({ name: 'edit-routine', routine: playing })}
          onclick={close}
        >
          <Icon name="edit" class="size-5" />
          {t('nav.editRoutine')}
        </a>
      </div>
    {/if}

    <ul class="flex flex-col gap-1">
      {#each links as link (link.label)}
        <li>
          <a
            class={[
              'flex items-center gap-3 rounded-xl px-3 py-3 font-medium hover:bg-tint/5',
              router.route.name === link.route.name && 'bg-tint/8',
            ]}
            href={href(link.route)}
            onclick={close}
          >
            <Icon name={link.icon} class="size-5 text-muted" />
            {t(link.label)}
          </a>
        </li>
      {/each}
    </ul>

    <section>
      <div class="mb-2 flex items-center justify-between pl-3">
        <h2 class="text-xs font-medium tracking-wide text-muted uppercase">
          {t('nav.startRoutine')}
        </h2>
        <a
          class="icon-btn size-9"
          href={href({ name: 'edit-routine' })}
          aria-label={t('nav.newRoutine')}
          onclick={close}
        >
          <Icon name="plus" class="size-5" />
        </a>
      </div>
      <ul class="flex flex-col gap-1">
        {#each library.routines as routine (routine.name)}
          <li>
            <a
              class={[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-tint/5',
                playing === routine.name && 'bg-tint/8',
              ]}
              href={href({ name: 'play', routine: routine.name })}
              onclick={close}
            >
              <Icon name="play" class="size-4 text-phase-work" filled />
              <span class="truncate">{routine.name}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
    <div class="mt-auto">
      <LanguageSwitch compact />
    </div>
  </nav>
</dialog>

<style>
  .menu[open] {
    animation: slide-in 200ms ease-out;
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
    }
  }
</style>
