<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte'
  import { stepDown, stepUp } from '../lib/util/step'
  import Icon from './Icon.svelte'

  interface Props {
    /** Seconds; `undefined` means "use the default" when `fallback` is given. */
    value: number | undefined
    label: string
    step: number
    min?: number
    /** Inherited value shown when empty; makes the field optional. */
    fallback?: number
    size?: 'md' | 'sm'
    /** Hide the visible label, e.g. when the surrounding card already names it. */
    hideLabel?: boolean
  }

  let {
    value = $bindable(),
    label,
    step,
    min = 0,
    fallback,
    size = 'md',
    hideLabel = false,
  }: Props = $props()

  const id = $props.id()
  const optional = $derived(fallback !== undefined)
  const current = $derived(value ?? fallback ?? 0)
  const buttonClass = $derived(
    [
      'grid shrink-0 place-items-center text-muted transition-colors hover:bg-tint/8 hover:text-fg active:bg-tint/12 disabled:opacity-30',
      size === 'sm' ? 'size-9' : 'size-11',
    ].join(' '),
  )

  function set(next: number | null | undefined) {
    value =
      next == null || Number.isNaN(next)
        ? optional
          ? undefined
          : min
        : Math.max(0, Math.round(next))
  }
</script>

<div class={size === 'sm' ? 'text-sm' : ''}>
  <label class={hideLabel ? 'sr-only' : 'label'} for={id}>{label}</label>
  <div
    class="flex items-center overflow-hidden rounded-xl border border-line bg-surface focus-within:border-accent"
  >
    <button
      type="button"
      class="{buttonClass} border-r border-line"
      aria-label={t('stepper.decrease', { label })}
      disabled={current <= min}
      onclick={() => set(stepDown(current, step, min))}
    >
      <Icon name="minus" class="size-4" />
    </button>
    <div class="relative min-w-0 flex-1">
      <input
        {id}
        class={[
          'w-full [appearance:textfield] bg-transparent pr-6 pl-2 text-center font-medium tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          size === 'sm' ? 'py-1.5' : 'py-2.5',
          value === undefined && 'placeholder:text-muted',
        ]}
        type="number"
        inputmode="numeric"
        min="0"
        step="1"
        required={!optional}
        placeholder={fallback?.toString()}
        value={value ?? ''}
        oninput={(e) => {
          const raw = e.currentTarget.value
          set(raw === '' ? undefined : Number(raw))
        }}
      />
      <span
        class="pointer-events-none absolute inset-y-0 right-2 grid place-items-center text-xs text-muted"
        >s</span
      >
    </div>
    <button
      type="button"
      class="{buttonClass} border-l border-line"
      aria-label={t('stepper.increase', { label })}
      onclick={() => set(stepUp(current, step))}
    >
      <Icon name="plus" class="size-4" />
    </button>
  </div>
  <!-- Inherited values show as muted placeholder; the reset link appears once overridden. -->
  {#if optional && value !== undefined}
    <p class="mt-1 text-center text-[11px] leading-4 text-muted">
      <button
        type="button"
        class="underline hover:text-fg"
        aria-label="{t('stepper.reset')} ({fallback} s)"
        onclick={() => (value = undefined)}
      >
        {size === 'sm' ? `↺ ${fallback} s` : `${t('stepper.reset')} (${fallback} s)`}
      </button>
    </p>
  {/if}
</div>
