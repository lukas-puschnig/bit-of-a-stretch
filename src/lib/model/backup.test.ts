import { describe, expect, it } from 'vitest'
import seed from '../../data/seed.json'
import { createBackup, mergeBy, parseBackup } from './backup'
import { DEFAULT_SETTINGS } from './types'
import { parseLibrary, ValidationError } from './validation'

const exercise = { id: 'a', name: 'A', duration: 30, bilateral: false }
const routine = { name: 'R', prepTime: 5, restTime: 10, entries: [{ exerciseId: 'a' }] }

describe('backup round trip', () => {
  it('parses what it exports', () => {
    const backup = createBackup([exercise], [routine], DEFAULT_SETTINGS, new Date(0))
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup)
  })

  it('rejects non-JSON and foreign files', () => {
    expect(() => parseBackup('{')).toThrow(ValidationError)
    expect(() => parseBackup('{"exercises": []}')).toThrow(/kein Backup/)
  })

  it('rejects backups from newer versions', () => {
    const backup = { ...createBackup([], [], DEFAULT_SETTINGS), version: 99 }
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/neueren/)
  })

  it('reports the path of invalid fields', () => {
    const backup = createBackup([{ ...exercise, duration: -1 }], [], DEFAULT_SETTINGS)
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('exercises[0].duration')
  })

  it('rejects duplicate ids', () => {
    const backup = createBackup([exercise, exercise], [], DEFAULT_SETTINGS)
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/mehrfach/)
  })

  it('ignores unknown theme values', () => {
    const backup = createBackup([], [], { ...DEFAULT_SETTINGS, theme: 'neon' as 'dark' })
    expect(parseBackup(JSON.stringify(backup)).settings.theme).toBe('system')
  })

  it('falls back to default settings', () => {
    const backup = { ...createBackup([], [], DEFAULT_SETTINGS), settings: undefined }
    expect(parseBackup(JSON.stringify(backup)).settings).toEqual(DEFAULT_SETTINGS)
  })
})

describe('mergeBy', () => {
  it('replaces matching items in place and appends new ones', () => {
    const merged = mergeBy(
      [
        { k: 'a', v: 1 },
        { k: 'b', v: 1 },
      ],
      [
        { k: 'b', v: 2 },
        { k: 'c', v: 2 },
      ],
      (x) => x.k,
    )
    expect(merged).toEqual([
      { k: 'a', v: 1 },
      { k: 'b', v: 2 },
      { k: 'c', v: 2 },
    ])
  })
})

describe('seed data', () => {
  it('is valid and only references existing exercises', () => {
    const library = parseLibrary(seed)
    const ids = new Set(library.exercises.map((e) => e.id))
    for (const r of library.routines) {
      for (const entry of r.entries) expect(ids).toContain(entry.exerciseId)
    }
  })
})
