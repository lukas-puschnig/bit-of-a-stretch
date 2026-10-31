<script lang="ts">
  interface Props {
    label: string
    hint?: string
    checked: boolean
    disabled?: boolean
    onchange: (checked: boolean) => void
  }

  let { label, hint, checked, disabled = false, onchange }: Props = $props()
</script>

<label class={['flex items-center justify-between gap-4', disabled && 'opacity-50']}>
  <span class="min-w-0">
    <span class="block">{label}</span>
    {#if hint}<span class="block text-xs text-muted">{hint}</span>{/if}
  </span>
  <input
    type="checkbox"
    role="switch"
    class="peer sr-only"
    {checked}
    {disabled}
    onchange={(e) => onchange(e.currentTarget.checked)}
  />
  <span
    class="relative h-7 w-12 shrink-0 rounded-full bg-tint/15 transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
    aria-hidden="true"
  ></span>
</label>
