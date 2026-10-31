<script lang="ts">
  import { onMount } from 'svelte'
  import Icon from '../components/Icon.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import SecondsInput from '../components/SecondsInput.svelte'
  import { parseBackup, type Backup } from '../lib/model/backup'
  import { ValidationError } from '../lib/model/validation'
  import { isStoragePersisted, requestPersistentStorage } from '../lib/storage/db'
  import { library, type ImportMode } from '../lib/stores/library.svelte'

  let persisted = $state<boolean>()
  let pending = $state<Backup>()
  let message = $state<{ text: string; error?: boolean }>()
  let fileInput: HTMLInputElement | undefined = $state()

  onMount(async () => {
    persisted = await isStoragePersisted()
  })

  async function requestPersist() {
    persisted = await requestPersistentStorage()
    if (!persisted)
      message = { text: 'Der Browser hat dauerhaften Speicher abgelehnt.', error: true }
  }

  function exportFile() {
    const backup = library.exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bit-of-a-stretch-${backup.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    message = { text: 'Backup exportiert.' }
  }

  async function readFile(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      pending = parseBackup(await file.text())
      message = undefined
    } catch (error) {
      pending = undefined
      const text =
        error instanceof ValidationError ? error.message : 'Datei konnte nicht gelesen werden.'
      message = { text, error: true }
    } finally {
      if (fileInput) fileInput.value = ''
    }
  }

  async function applyImport(mode: ImportMode) {
    if (!pending) return
    await library.importBackup(pending, mode)
    message = {
      text: `${pending.exercises.length} Übungen und ${pending.routines.length} Routinen importiert.`,
    }
    pending = undefined
  }

  async function resetToSamples() {
    if (!confirm('Alle Übungen und Routinen durch die Beispieldaten ersetzen?')) return
    await library.loadSampleData()
    message = { text: 'Beispieldaten geladen.' }
  }

  let defaultSwitchTime = $derived(library.settings.defaultSwitchTime)
</script>

<PageLayout title="Daten & Einstellungen" back={{ name: 'home' }}>
  <div class="flex flex-col gap-6">
    <section
      class="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
    >
      <Icon name="info" class="size-5 shrink-0 text-amber-300" />
      <div class="space-y-2">
        <p>
          Deine Übungen und Routinen liegen <strong>nur in diesem Browser auf diesem Gerät</strong>.
          Wenn du Website-Daten löschst, im privaten Modus surfst oder das Gerät wechselst, sind sie
          weg.
        </p>
        <p>Exportiere regelmäßig ein Backup. Darüber kannst du auch zwischen Geräten übertragen.</p>
        {#if library.storageError}
          <p class="font-medium text-rose-300">{library.storageError}</p>
        {/if}
      </div>
    </section>

    {#if message}
      <p
        class={[
          'rounded-lg px-3 py-2 text-sm',
          message.error ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300',
        ]}
        role="status"
      >
        {message.text}
      </p>
    {/if}

    <section class="card p-4">
      <h2 class="font-semibold">Backup</h2>
      <p class="mt-1 text-sm text-muted">
        Alle Übungen, Routinen und Einstellungen als JSON-Datei.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="btn-primary" onclick={exportFile}>
          <Icon name="download" class="size-4" /> Exportieren
        </button>
        <button type="button" class="btn-secondary" onclick={() => fileInput?.click()}>
          <Icon name="upload" class="size-4" /> Importieren …
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept="application/json,.json"
          class="hidden"
          onchange={readFile}
        />
      </div>

      {#if pending}
        <div class="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
          <p>
            Backup vom {new Date(pending.exportedAt).toLocaleString('de-DE')}:
            <strong>{pending.exercises.length} Übungen</strong>,
            <strong>{pending.routines.length} Routinen</strong>.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="btn-primary" onclick={() => applyImport('merge')}
              >Zusammenführen</button
            >
            <button type="button" class="btn-danger" onclick={() => applyImport('replace')}
              >Alles ersetzen</button
            >
            <button type="button" class="btn-secondary" onclick={() => (pending = undefined)}
              >Abbrechen</button
            >
          </div>
          <p class="mt-2 text-xs text-muted">
            Zusammenführen überschreibt gleichnamige Routinen und Übungen mit gleicher ID und behält
            alles andere.
          </p>
        </div>
      {/if}
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">Dauerhafter Speicher</h2>
      <p class="mt-1 text-sm text-muted">
        {#if persisted === undefined}
          Wird geprüft …
        {:else if persisted}
          Aktiv: Der Browser löscht die Daten nicht von sich aus, wenn der Speicher knapp wird.
        {:else}
          Nicht aktiv: Der Browser darf die Daten bei Speichermangel löschen.
        {/if}
      </p>
      {#if persisted === false}
        <button type="button" class="mt-3 btn-secondary" onclick={requestPersist}
          >Dauerhaften Speicher anfragen</button
        >
      {/if}
    </section>

    <section class="flex flex-col gap-4 card p-4">
      <h2 class="font-semibold">Einstellungen</h2>
      <label class="flex items-center justify-between gap-3">
        <span>
          <span class="block">Ton</span>
          <span class="block text-xs text-muted"
            >Signale bei Phasenwechsel und in den letzten drei Sekunden</span
          >
        </span>
        <input
          type="checkbox"
          class="size-5 accent-accent"
          checked={library.settings.audioEnabled}
          onchange={(e) => library.updateSettings({ audioEnabled: e.currentTarget.checked })}
        />
      </label>
      <div class="max-w-48">
        <SecondsInput
          label="Standard-Seitenwechsel"
          bind:value={
            () => defaultSwitchTime,
            (v) => void library.updateSettings({ defaultSwitchTime: v ?? 0 })
          }
        />
      </div>
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">Zurücksetzen</h2>
      <p class="mt-1 text-sm text-muted">Ersetzt alle Daten durch die mitgelieferten Beispiele.</p>
      <button type="button" class="mt-3 btn-danger" onclick={resetToSamples}
        >Beispieldaten laden</button
      >
    </section>
  </div>
</PageLayout>
