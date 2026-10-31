import seed from '../../data/seed.json'
import { createBackup, mergeBy, type Backup } from '../model/backup'
import { DEFAULT_SETTINGS, type Exercise, type Routine, type Settings } from '../model/types'
import { parseLibrary } from '../model/validation'
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
  /** Set when changes cannot be saved in this browser. */
  storageError = $state<string>()

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
        await this.loadSampleData()
      }
    } catch (error) {
      console.error(error)
      this.storageError =
        'Der Browser erlaubt hier keine Speicherung (z. B. privater Modus). Änderungen gehen beim Schließen verloren.'
      this.storage = undefined
      this.applySampleData()
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

  async loadSampleData() {
    this.applySampleData()
    await this.writeAll()
  }

  private applySampleData() {
    const library = parseLibrary(seed)
    this.exercises = sortByName(library.exercises)
    this.routines = library.routines
    this.settings = { ...DEFAULT_SETTINGS }
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
