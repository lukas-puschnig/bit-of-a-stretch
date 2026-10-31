<script lang="ts">
  import { onMount } from 'svelte'
  import Icon from '../components/Icon.svelte'
  import LanguageSwitch from '../components/LanguageSwitch.svelte'
  import PageLayout from '../components/PageLayout.svelte'
  import Stepper from '../components/Stepper.svelte'
  import Switch from '../components/Switch.svelte'
  import { Announcer } from '../lib/audio/speech'
  import { t, tc } from '../lib/i18n/i18n.svelte'
  import { parseBackup, type Backup } from '../lib/model/backup'
  import { THEME_PREFERENCES, TIMING } from '../lib/model/types'
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

  const counts = (backup: { exercises: unknown[]; routines: unknown[] }) => ({
    exercises: tc('count.exercises', backup.exercises.length),
    routines: tc('count.routines', backup.routines.length),
  })

  async function requestPersist() {
    persisted = await requestPersistentStorage()
    if (!persisted) message = { text: t('data.persistDenied'), error: true }
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
    message = { text: t('data.exported') }
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
        error instanceof ValidationError ? t(error.key, error.params) : t('data.readError')
      message = { text, error: true }
    } finally {
      if (fileInput) fileInput.value = ''
    }
  }

  async function applyImport(mode: ImportMode) {
    if (!pending) return
    await library.importBackup(pending, mode)
    message = { text: t('data.imported', counts(pending)) }
    pending = undefined
  }

  async function addCatalog() {
    const added = await library.addMissingCatalogExercises(library.settings.language)
    message = { text: t('data.catalogDone', { exercises: tc('count.exercises', added) }) }
  }

  async function resetToSamples() {
    if (!confirm(t('data.resetConfirm'))) return
    await library.loadSampleData(library.settings.language)
    message = { text: t('data.resetDone') }
  }

  let defaultSwitchTime = $derived(library.settings.defaultSwitchTime)
</script>

<PageLayout title={t('data.title')} back={{ name: 'home' }}>
  <div class="flex flex-col gap-6">
    <section
      class="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-fg"
    >
      <Icon name="info" class="size-5 shrink-0 text-warning" />
      <div class="space-y-2">
        <p>
          {t('data.noticeLead')} <strong>{t('data.noticeStrong')}</strong>{t('data.noticeRest')}
        </p>
        <p>{t('data.noticeExport')}</p>
        {#if library.storageUnavailable}
          <p class="font-medium text-danger">{t('data.storageUnavailable')}</p>
        {/if}
      </div>
    </section>

    {#if message}
      <p
        class={[
          'rounded-lg px-3 py-2 text-sm',
          message.error ? 'bg-rose-500/10 text-danger' : 'bg-emerald-500/10 text-success',
        ]}
        role="status"
      >
        {message.text}
      </p>
    {/if}

    <section class="flex flex-col gap-4 card p-4">
      <h2 class="font-semibold">{t('data.settings')}</h2>
      <div>
        <p class="label">{t('data.language')}</p>
        <LanguageSwitch />
      </div>
      <fieldset>
        <legend class="label">{t('data.theme')}</legend>
        <div class="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
          {#each THEME_PREFERENCES as option (option)}
            <label
              class={[
                'cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent',
                library.settings.theme === option
                  ? 'bg-surface text-fg shadow-sm'
                  : 'text-muted hover:text-fg',
              ]}
            >
              <input
                type="radio"
                name="theme"
                class="sr-only"
                value={option}
                checked={library.settings.theme === option}
                onchange={() => library.updateSettings({ theme: option })}
              />
              {t(`theme.${option}`)}
            </label>
          {/each}
        </div>
      </fieldset>
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
      <Switch
        label={t('data.images')}
        hint={t('data.imagesHint')}
        checked={library.settings.showImages}
        onchange={(showImages) => library.updateSettings({ showImages })}
      />
      <div class="max-w-52">
        <Stepper
          label={t('data.defaultSwitch')}
          step={TIMING.switch.step}
          bind:value={
            () => defaultSwitchTime,
            (v) => void library.updateSettings({ defaultSwitchTime: v ?? 0 })
          }
        />
      </div>
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">{t('data.backup')}</h2>
      <p class="mt-1 text-sm text-muted">{t('data.backupHint')}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="btn-primary" onclick={exportFile}>
          <Icon name="download" class="size-4" />
          {t('data.export')}
        </button>
        <button type="button" class="btn-secondary" onclick={() => fileInput?.click()}>
          <Icon name="upload" class="size-4" />
          {t('data.import')}
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
            {t('data.pending', {
              date: new Date(pending.exportedAt).toLocaleString(library.settings.language),
              ...counts(pending),
            })}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="btn-primary" onclick={() => applyImport('merge')}
              >{t('data.merge')}</button
            >
            <button type="button" class="btn-danger" onclick={() => applyImport('replace')}
              >{t('data.replace')}</button
            >
            <button type="button" class="btn-secondary" onclick={() => (pending = undefined)}
              >{t('common.cancel')}</button
            >
          </div>
          <p class="mt-2 text-xs text-muted">{t('data.mergeHint')}</p>
        </div>
      {/if}
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">{t('data.persistTitle')}</h2>
      <p class="mt-1 text-sm text-muted">
        {#if persisted === undefined}
          {t('data.persistChecking')}
        {:else if persisted}
          {t('data.persistOn')}
        {:else}
          {t('data.persistOff')}
        {/if}
      </p>
      {#if persisted === false}
        <button type="button" class="mt-3 btn-secondary" onclick={requestPersist}
          >{t('data.persistRequest')}</button
        >
      {/if}
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">{t('data.catalog')}</h2>
      <p class="mt-1 text-sm text-muted">{t('data.catalogHint')}</p>
      <button type="button" class="mt-3 btn-secondary" onclick={addCatalog}
        >{t('data.catalogButton')}</button
      >
    </section>

    <section class="card p-4 text-sm">
      <h2 class="font-semibold">{t('data.about')}</h2>
      <p class="mt-1 text-muted">{t('data.aboutText')}</p>
      <ul class="mt-2 flex flex-col gap-1">
        <li>
          <a
            class="text-accent underline"
            href="{import.meta.env.BASE_URL}third-party-licenses.md"
            target="_blank"
            rel="noopener">{t('data.licenses')}</a
          >
        </li>
        <li>
          <a
            class="text-accent underline"
            href="https://github.com/GoogleChrome/workbox/blob/v7/LICENSE"
            target="_blank"
            rel="noopener">{t('data.workbox')}</a
          >
        </li>
      </ul>
    </section>

    <section class="card p-4">
      <h2 class="font-semibold">{t('data.reset')}</h2>
      <p class="mt-1 text-sm text-muted">{t('data.resetHint')}</p>
      <button type="button" class="mt-3 btn-danger" onclick={resetToSamples}
        >{t('data.resetButton')}</button
      >
    </section>
  </div>
</PageLayout>
