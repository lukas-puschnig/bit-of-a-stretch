<script lang="ts">
  interface Props {
    value: number | undefined
    label: string
    /** Shown when empty; an empty field means "use the default". */
    placeholder?: string
    optional?: boolean
    id?: string
  }

  let { value = $bindable(), label, placeholder, optional = false, id }: Props = $props()

  const uid = $props.id()
  const inputId = $derived(id ?? uid)
</script>

<div>
  <label class="label" for={inputId}>{label}</label>
  <div class="relative">
    <input
      id={inputId}
      class="field pr-8 tabular-nums"
      type="number"
      inputmode="numeric"
      min="0"
      step="1"
      required={!optional}
      {placeholder}
      bind:value={
        () => value,
        (v: number | null | undefined) =>
          (value = v == null ? undefined : Math.max(0, Math.round(v)))
      }
    />
    <span
      class="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-muted"
      >s</span
    >
  </div>
</div>
