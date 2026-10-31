import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, type Exercise, type Routine } from '../model/types'
import { Storage } from './db'

const exercise: Exercise = { id: 'a', name: 'A', duration: 30, bilateral: false }
const routine = (name: string): Routine => ({
  name,
  prepTime: 5,
  restTime: 10,
  entries: [{ exerciseId: 'a' }],
})

let storage: Storage
let dbCount = 0
const open = async () => (storage = await Storage.open(`test-${dbCount++}`))

afterEach(() => storage.close())

describe('Storage', () => {
  it('starts empty and uninitialized', async () => {
    await open()
    expect(await storage.load()).toEqual({
      exercises: [],
      routines: [],
      settings: undefined,
      initialized: false,
    })
  })

  it('replaces all data and keeps routine order', async () => {
    await open()
    await storage.replaceAll([exercise], [routine('Z'), routine('A')], DEFAULT_SETTINGS)
    const data = await storage.load()
    expect(data.initialized).toBe(true)
    expect(data.exercises).toEqual([exercise])
    expect(data.routines.map((r) => r.name)).toEqual(['Z', 'A'])
    expect(data.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('renames a routine by deleting the old key', async () => {
    await open()
    await storage.replaceAll([exercise], [routine('Old')], DEFAULT_SETTINGS)
    await storage.putRoutine(routine('New'), ['New'], 'Old')
    expect((await storage.load()).routines.map((r) => r.name)).toEqual(['New'])
  })

  it('deletes routines and exercises', async () => {
    await open()
    await storage.replaceAll([exercise], [routine('R')], DEFAULT_SETTINGS)
    await storage.deleteRoutine('R', [])
    await storage.deleteExercise('a')
    const data = await storage.load()
    expect(data.routines).toEqual([])
    expect(data.exercises).toEqual([])
  })
})
