import {
  DEFAULT_SETTINGS,
  THEME_PREFERENCES,
  type Exercise,
  type Routine,
  type RoutineEntry,
  type Settings,
} from './types'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function fail(path: string, expected: string): never {
  throw new ValidationError(`${path}: ${expected} erwartet`)
}

function requireString(obj: Json, key: string, path: string): string {
  const value = obj[key]
  if (typeof value !== 'string' || value.trim() === '') fail(`${path}.${key}`, 'Text')
  return value.trim()
}

function optionalString(obj: Json, key: string, path: string): string | undefined {
  const value = obj[key]
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') fail(`${path}.${key}`, 'Text')
  return value
}

function requireSeconds(obj: Json, key: string, path: string): number {
  const value = obj[key]
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    fail(`${path}.${key}`, 'Sekunden ≥ 0')
  }
  return Math.round(value)
}

function optionalSeconds(obj: Json, key: string, path: string): number | undefined {
  return obj[key] === undefined || obj[key] === null ? undefined : requireSeconds(obj, key, path)
}

function requireArray(obj: Json, key: string, path: string): unknown[] {
  const value = obj[key]
  if (!Array.isArray(value)) fail(`${path}.${key}`, 'Liste')
  return value
}

/** Drops keys whose value is undefined so stored objects stay minimal. */
function compact<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

export function parseExercise(value: unknown, path = 'exercise'): Exercise {
  if (!isObject(value)) fail(path, 'Objekt')
  if (typeof value.bilateral !== 'boolean') fail(`${path}.bilateral`, 'true/false')
  return compact({
    id: requireString(value, 'id', path),
    name: requireString(value, 'name', path),
    notes: optionalString(value, 'notes', path),
    image: optionalString(value, 'image', path),
    duration: requireSeconds(value, 'duration', path),
    bilateral: value.bilateral,
    switchTime: optionalSeconds(value, 'switchTime', path),
  })
}

function parseEntry(value: unknown, path: string): RoutineEntry {
  if (!isObject(value)) fail(path, 'Objekt')
  return compact({
    exerciseId: requireString(value, 'exerciseId', path),
    duration: optionalSeconds(value, 'duration', path),
    restAfter: optionalSeconds(value, 'restAfter', path),
    switchTime: optionalSeconds(value, 'switchTime', path),
  })
}

export function parseRoutine(value: unknown, path = 'routine'): Routine {
  if (!isObject(value)) fail(path, 'Objekt')
  return compact({
    name: requireString(value, 'name', path),
    description: optionalString(value, 'description', path),
    prepTime: requireSeconds(value, 'prepTime', path),
    restTime: requireSeconds(value, 'restTime', path),
    entries: requireArray(value, 'entries', path).map((e, i) =>
      parseEntry(e, `${path}.entries[${i}]`),
    ),
  })
}

export function parseSettings(value: unknown): Settings {
  if (!isObject(value)) return { ...DEFAULT_SETTINGS }
  return {
    audioEnabled:
      typeof value.audioEnabled === 'boolean' ? value.audioEnabled : DEFAULT_SETTINGS.audioEnabled,
    defaultSwitchTime:
      optionalSeconds(value, 'defaultSwitchTime', 'settings') ?? DEFAULT_SETTINGS.defaultSwitchTime,
    theme: THEME_PREFERENCES.find((t) => t === value.theme) ?? DEFAULT_SETTINGS.theme,
  }
}

function assertUnique(keys: string[], label: string) {
  const seen = new Set<string>()
  for (const key of keys) {
    if (seen.has(key)) throw new ValidationError(`${label} „${key}“ kommt mehrfach vor`)
    seen.add(key)
  }
}

export interface Library {
  exercises: Exercise[]
  routines: Routine[]
}

export function parseLibrary(value: unknown): Library {
  if (!isObject(value)) fail('Datei', 'JSON-Objekt')
  const exercises = requireArray(value, 'exercises', 'Datei').map((e, i) =>
    parseExercise(e, `exercises[${i}]`),
  )
  const routines = requireArray(value, 'routines', 'Datei').map((r, i) =>
    parseRoutine(r, `routines[${i}]`),
  )
  assertUnique(
    exercises.map((e) => e.id),
    'Übungs-ID',
  )
  assertUnique(
    routines.map((r) => r.name),
    'Routine',
  )
  return { exercises, routines }
}
