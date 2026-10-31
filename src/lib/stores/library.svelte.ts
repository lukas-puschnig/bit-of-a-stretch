import { detectLocale, type Locale } from '../i18n/translate'
import { createBackup, mergeBy, type Backup } from '../model/backup'
import { missingCatalogExercises, missingCatalogRoutines, sampleLibrary } from '../model/catalog'
import { DEFAULT_SETTINGS, type Exercise, type Routine, type Settings } from '../model/types'
import { requestPersistentStorage, Storage } from '../storage/db'

export type ImportMode = 'replace' | 'merge'

/**
 * Single source of truth for exercises, routines and settings.
 * State lives in memory and every change is written through to IndexedDB.
 * If IndexedDB is unavailable the app still works, but nothing is kept.
 */
class Library {
  exercises = $state<Exercise[]>([])
  routines = $state<Routine[]>([])
  settings = $state<Settings>({ ...DEFAULT_SETTINGS })
  ready = $state(false)
  /** True when changes cannot be saved in this browser. */
  storageUnavailable = $state(false)

  readonly exerciseById = $derived(new Map(this.exercises.map((e) => [e.id, e])))

  private storage: Storage | undefined
  private persistRequested = false

  async init() {
    try {
      this.storage = await Storage.open()
      const stored = await this.storage.load()
      if (stored.initialized) {
        this.exercises = stored.exercises
        this.routines = stored.routines
        this.settings = { ...DEFAULT_SETTINGS, ...stored.settings }
      } else {
        await this.loadSampleData(detectLocale())
      }
    } catch (error) {
      console.error(error)
      this.storageUnavailable = true
      this.storage = undefined
      this.applySampleData(detectLocale())
    }
    this.ready = true
  }

  routine(name: string): Routine | undefined {
    return this.routines.find((r) => r.name === name)
  }

  routinesUsing(exerciseId: string): Routine[] {
    return this.routines.filter((r) => r.entries.some((e) => e.exerciseId === exerciseId))
  }

  async saveExercise(exercise: Exercise) {
    this.exercises = sortByName(mergeBy(this.exercises, [exercise], (e) => e.id))
    await this.write((s) => s.putExercise(exercise))
  }

  /** Deletes an exercise and removes it from every routine that uses it. */
  async deleteExercise(id: string) {
    const affected = this.routinesUsing(id).map((r) => ({
      ...r,
      entries: r.entries.filter((e) => e.exerciseId !== id),
    }))
    this.exercises = this.exercises.filter((e) => e.id !== id)
    this.routines = mergeBy(this.routines, affected, (r) => r.name)
    const order = this.routineOrder()
    await this.write(async (s) => {
      await s.deleteExercise(id)
      for (const routine of affected) await s.putRoutine(routine, order)
    })
  }

  /** Saves a routine. Pass `previousName` when editing, so renames replace the old one. */
  async saveRoutine(routine: Routine, previousName?: string) {
    const index = this.routines.findIndex((r) => r.name === (previousName ?? routine.name))
    this.routines = index >= 0 ? this.routines.with(index, routine) : [...this.routines, routine]
    const order = this.routineOrder()
    await this.write((s) => s.putRoutine(routine, order, previousName))
  }

  async deleteRoutine(name: string) {
    this.routines = this.routines.filter((r) => r.name !== name)
    const order = this.routineOrder()
    await this.write((s) => s.deleteRoutine(name, order))
  }

  async updateSettings(patch: Partial<Settings>) {
    this.settings = { ...this.settings, ...patch }
    const settings = $state.snapshot(this.settings)
    await this.write((s) => s.putSettings(settings))
  }

  exportBackup(): Backup {
    return createBackup(
      $state.snapshot(this.exercises),
      $state.snapshot(this.routines),
      $state.snapshot(this.settings),
    )
  }

  async importBackup(backup: Backup, mode: ImportMode) {
    if (mode === 'replace') {
      this.exercises = sortByName(backup.exercises)
      this.routines = backup.routines
      this.settings = backup.settings
    } else {
      this.exercises = sortByName(mergeBy(this.exercises, backup.exercises, (e) => e.id))
      this.routines = mergeBy(this.routines, backup.routines, (r) => r.name)
    }
    await this.writeAll()
  }

  /** Replaces everything with the built-in samples; keeps theme and sound settings. */
  async loadSampleData(locale: Locale) {
    this.applySampleData(locale)
    await this.writeAll()
  }

  /**
   * Switches the language and translates sample exercises and routines the
   * user has not renamed, so a fresh install follows the language switch.
   * Returns renamed routines (old name → new name).
   */
  async setLanguage(locale: Locale): Promise<Map<string, string>> {
    // A plain return value, not reactive state.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const renamed = new Map<string, string>()
    const from = this.settings.language
    this.settings = { ...this.settings, language: locale }
    if (from === locale) return renamed
    const before = sampleLibrary(from)
    const after = sampleLibrary(locale)

    const exerciseText = new Map(before.exercises.map((e) => [e.id, e]))
    const translatedExercises = new Map(after.exercises.map((e) => [e.id, e]))
    this.exercises = sortByName(
      this.exercises.map((e) => {
        const old = exerciseText.get(e.id)
        const next = translatedExercises.get(e.id)
        if (!old || !next) return e
        return {
          ...e,
          name: e.name === old.name ? next.name : e.name,
          notes: e.notes === old.notes ? next.notes : e.notes,
        }
      }),
    )

    // Sample routines appear in the same order in every language.
    const taken = new Set(this.routines.map((r) => r.name))
    this.routines = this.routines.map((r) => {
      const index = before.routines.findIndex((s) => s.name === r.name)
      const next = after.routines[index]
      if (index < 0 || !next || taken.has(next.name)) return r
      renamed.set(r.name, next.name)
      const description =
        r.description === before.routines[index]!.description ? next.description : r.description
      return { ...r, name: next.name, ...(description !== undefined && { description }) }
    })
    await this.writeAll()
    return renamed
  }

  /**
   * Adds catalog exercises and sample routines that are missing, e.g. after an
   * app update. Returns how many of each.
   */
  async addMissingCatalog(locale: Locale): Promise<{ exercises: number; routines: number }> {
    const exercises = missingCatalogExercises(this.exerciseById.keys(), locale)
    const routines = missingCatalogRoutines(this.routineOrder(), locale)
    this.exercises = sortByName([...this.exercises, ...exercises])
    this.routines = [...this.routines, ...routines]
    const order = this.routineOrder()
    await this.write(async (s) => {
      for (const exercise of exercises) await s.putExercise(exercise)
      for (const routine of routines) await s.putRoutine(routine, order)
    })
    return { exercises: exercises.length, routines: routines.length }
  }

  private applySampleData(locale: Locale) {
    const library = sampleLibrary(locale)
    this.exercises = sortByName(library.exercises)
    this.routines = library.routines
    this.settings = { ...DEFAULT_SETTINGS, ...$state.snapshot(this.settings), language: locale }
  }

  private routineOrder() {
    return this.routines.map((r) => r.name)
  }

  private async writeAll() {
    const exercises = $state.snapshot(this.exercises)
    const routines = $state.snapshot(this.routines)
    const settings = $state.snapshot(this.settings)
    await this.write((s) => s.replaceAll(exercises, routines, settings))
  }

  private async write(operation: (storage: Storage) => Promise<void>) {
    if (!this.storage) return
    await operation(this.storage)
    if (!this.persistRequested) {
      this.persistRequested = true
      void requestPersistentStorage()
    }
  }
}

function sortByName(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name, 'de'))
}

export const library = new Library()
