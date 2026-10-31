<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte'
  import Icon from './Icon.svelte'

  interface Props {
    running: boolean
    color: string
    onprevious: () => void
    ontoggle: () => void
    onnext: () => void
  }

  let { running, color, onprevious, ontoggle, onnext }: Props = $props()
</script>

<div class="flex shrink-0 items-center justify-center gap-8">
  <button
    type="button"
    class="icon-btn size-16 bg-tint/5"
    aria-label={t('player.previous')}
    onclick={onprevious}
  >
    <Icon name="prev" class="size-7" />
  </button>
  <button
    type="button"
    class="inline-flex size-20 items-center justify-center rounded-full text-white shadow-lg transition-[background-color,transform] duration-300 active:scale-95"
    style="background: {color}"
    aria-label={running ? t('player.pause') : t('player.start')}
    onclick={ontoggle}
  >
    <Icon name={running ? 'pause' : 'play'} filled class="size-9" />
  </button>
  <button
    type="button"
    class="icon-btn size-16 bg-tint/5"
    aria-label={t('player.next')}
    onclick={onnext}
  >
    <Icon name="next" class="size-7" />
  </button>
</div>
