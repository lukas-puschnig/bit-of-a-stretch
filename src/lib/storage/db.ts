import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Exercise, Routine, Settings } from '../model/types'

interface StretchDB extends DBSchema {
  exercises: { key: string; value: Exercise }
  routines: { key: string; value: Routine }
  /** Ordering of routines and other small records. */
  meta: { key: string; value: unknown }
}

const DB_NAME = 'bit-of-a-stretch'
const DB_VERSION = 1

const META_SETTINGS = 'settings'
const META_ROUTINE_ORDER = 'routineOrder'
const META_INITIALIZED = 'initialized'

export interface StoredData {
  exercises: Exercise[]
  routines: Routine[]
  settings: Settings | undefined
  initialized: boolean
}

export class Storage {
  private constructor(private readonly db: IDBPDatabase<StretchDB>) {}

  static async open(name = DB_NAME): Promise<Storage> {
    const db = await openDB<StretchDB>(name, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('exercises', { keyPath: 'id' })
        db.createObjectStore('routines', { keyPath: 'name' })
        db.createObjectStore('meta')
      },
    })
    return new Storage(db)
  }

  async load(): Promise<StoredData> {
    const tx = this.db.transaction(['exercises', 'routines', 'meta'])
    const [exercises, routines, settings, order, initialized] = await Promise.all([
      tx.objectStore('exercises').getAll(),
      tx.objectStore('routines').getAll(),
      tx.objectStore('meta').get(META_SETTINGS),
      tx.objectStore('meta').get(META_ROUTINE_ORDER),
      tx.objectStore('meta').get(META_INITIALIZED),
    ])
    return {
      exercises: exercises.sort((a, b) => a.name.localeCompare(b.name)),
      routines: sortByOrder(routines, Array.isArray(order) ? order : []),
      settings: settings as Settings | undefined,
      initialized: initialized === true,
    }
  }

  /** Replaces everything in the database in one transaction. */
  async replaceAll(exercises: Exercise[], routines: Routine[], settings: Settings): Promise<void> {
    const tx = this.db.transaction(['exercises', 'routines', 'meta'], 'readwrite')
    const exerciseStore = tx.objectStore('exercises')
    const routineStore = tx.objectStore('routines')
    const meta = tx.objectStore('meta')
    await Promise.all([exerciseStore.clear(), routineStore.clear()])
    await Promise.all([
      ...exercises.map((e) => exerciseStore.put(e)),
      ...routines.map((r) => routineStore.put(r)),
      meta.put(settings, META_SETTINGS),
      meta.put(
        routines.map((r) => r.name),
        META_ROUTINE_ORDER,
      ),
      meta.put(true, META_INITIALIZED),
    ])
    await tx.done
  }

  async putExercise(exercise: Exercise): Promise<void> {
    await this.db.put('exercises', exercise)
  }

  async deleteExercise(id: string): Promise<void> {
    await this.db.delete('exercises', id)
  }

  /** Saves a routine; pass `previousName` when it was renamed. */
  async putRoutine(routine: Routine, order: string[], previousName?: string): Promise<void> {
    const tx = this.db.transaction(['routines', 'meta'], 'readwrite')
    const store = tx.objectStore('routines')
    if (previousName !== undefined && previousName !== routine.name) {
      await store.delete(previousName)
    }
    await Promise.all([store.put(routine), tx.objectStore('meta').put(order, META_ROUTINE_ORDER)])
    await tx.done
  }

  async deleteRoutine(name: string, order: string[]): Promise<void> {
    const tx = this.db.transaction(['routines', 'meta'], 'readwrite')
    await Promise.all([
      tx.objectStore('routines').delete(name),
      tx.objectStore('meta').put(order, META_ROUTINE_ORDER),
    ])
    await tx.done
  }

  async putSettings(settings: Settings): Promise<void> {
    await this.db.put('meta', settings, META_SETTINGS)
  }

  close() {
    this.db.close()
  }
}

function sortByOrder(routines: Routine[], order: unknown[]): Routine[] {
  const rank = new Map(order.map((name, i) => [name, i]))
  return routines.sort(
    (a, b) =>
      (rank.get(a.name) ?? Infinity) - (rank.get(b.name) ?? Infinity) ||
      a.name.localeCompare(b.name),
  )
}

/** Asks the browser not to evict our data under storage pressure. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}

export async function isStoragePersisted(): Promise<boolean> {
  return (await navigator.storage?.persisted?.()) ?? false
}
