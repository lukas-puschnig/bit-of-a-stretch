import type { Exercise, Routine, Settings } from './types'
import { parseLibrary, parseSettings, ValidationError, type Library } from './validation'

export const BACKUP_FORMAT = 'bit-of-a-stretch'
export const BACKUP_VERSION = 1

export interface Backup extends Library {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  settings: Settings
}

export function createBackup(
  exercises: Exercise[],
  routines: Routine[],
  settings: Settings,
  now = new Date(),
): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    settings,
    exercises,
    routines,
  }
}

export function parseBackup(text: string): Backup {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new ValidationError('Die Datei ist kein gültiges JSON')
  }
  if (typeof raw !== 'object' || raw === null || (raw as Backup).format !== BACKUP_FORMAT) {
    throw new ValidationError('Die Datei ist kein Backup dieser App')
  }
  const { version, exportedAt, settings } = raw as Partial<Backup>
  if (typeof version !== 'number' || version > BACKUP_VERSION) {
    throw new ValidationError('Das Backup stammt aus einer neueren App-Version')
  }
  return {
    format: BACKUP_FORMAT,
    version,
    exportedAt: typeof exportedAt === 'string' ? exportedAt : '',
    settings: parseSettings(settings),
    ...parseLibrary(raw),
  }
}

/** Upserts `incoming` into `current`, keyed by `key`; existing order is kept. */
export function mergeBy<T>(current: T[], incoming: T[], key: (item: T) => string): T[] {
  const byKey = new Map(incoming.map((item) => [key(item), item]))
  const merged = current.map((item) => byKey.get(key(item)) ?? item)
  const existing = new Set(current.map(key))
  return [...merged, ...incoming.filter((item) => !existing.has(key(item)))]
}
