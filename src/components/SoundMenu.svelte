<script lang="ts">
  import { Announcer } from '../lib/audio/speech'
  import { t } from '../lib/i18n/i18n.svelte'
  import { library } from '../lib/stores/library.svelte'
  import Icon from './Icon.svelte'
  import Switch from './Switch.svelte'

  interface Props {
    /** Called from the click, so audio can be unlocked within a user gesture. */
    onunlock: () => void
  }

  let { onunlock }: Props = $props()

  let open = $state(false)
  let root: HTMLDivElement | undefined = $state()

  const anySound = $derived(
    library.settings.audioEnabled || (library.settings.voiceEnabled && Announcer.supported),
  )

  function onWindowClick(event: MouseEvent) {
    if (open && root && !root.contains(event.target as Node)) open = false
  }
</script>

<svelte:window onclick={onWindowClick} onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div class="relative" bind:this={root}>
  <button
    type="button"
    class="icon-btn"
    aria-label={t('player.sound')}
    aria-expanded={open}
    onclick={() => {
      onunlock()
      open = !open
    }}
  >
    <Icon name={anySound ? 'volume' : 'mute'} />
  </button>
  {#if open}
    <div
      class="absolute top-full left-0 z-20 mt-1 flex w-72 flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-2xl"
    >
      <Switch
        label={t('sound.beeps')}
        hint={t('sound.beepsHint')}
        checked={library.settings.audioEnabled}
        onchange={(audioEnabled) => library.updateSettings({ audioEnabled })}
      />
      <Switch
        label={t('sound.voice')}
        hint={Announcer.supported ? t('sound.voiceHint') : t('sound.voiceUnavailable')}
        checked={library.settings.voiceEnabled && Announcer.supported}
        disabled={!Announcer.supported}
        onchange={(voiceEnabled) => library.updateSettings({ voiceEnabled })}
      />
    </div>
  {/if}
</div>
