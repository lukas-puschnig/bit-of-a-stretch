/** All durations are whole seconds. */

export interface Exercise {
  id: string
  name: string
  notes?: string
  /** URL or path relative to the app's base URL. */
  image?: string
  /** Default duration; for bilateral exercises this is per side. */
  duration: number
  bilateral: boolean
  /** Time to switch sides; falls back to `Settings.defaultSwitchTime`. */
  switchTime?: number
}

/** One slot in a routine. Optional fields override the referenced exercise or routine. */
export interface RoutineEntry {
  exerciseId: string
  duration?: number
  /** Rest after this entry; falls back to `Routine.restTime`. */
  restAfter?: number
  switchTime?: number
}

export interface Routine {
  /** Unique, used as key. */
  name: string
  description?: string
  prepTime: number
  restTime: number
  entries: RoutineEntry[]
}

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export interface Settings {
  audioEnabled: boolean
  defaultSwitchTime: number
  theme: ThemePreference
}

export const DEFAULT_SETTINGS: Settings = {
  audioEnabled: true,
  defaultSwitchTime: 5,
  theme: 'system',
}

export type Side = 'left' | 'right'

export type PhaseKind = 'prep' | 'work' | 'switch' | 'rest'

/** An entry with all overrides and defaults applied. */
export interface ResolvedEntry {
  /** Position among the playable entries (missing exercises are dropped). */
  index: number
  exercise: Exercise
  duration: number
  bilateral: boolean
  switchTime: number
  restAfter: number
  /** Total time including both sides and switch, excluding rest. */
  totalDuration: number
}

export interface Phase {
  kind: PhaseKind
  duration: number
  /** Offset from the start of the routine. */
  start: number
  /**
   * The entry this phase belongs to. For `prep` and `rest` this is the entry
   * that comes next, so the UI can announce it.
   */
  entryIndex: number
  side?: Side
}

export interface Plan {
  entries: ResolvedEntry[]
  phases: Phase[]
  totalDuration: number
  /** Exercise ids referenced by the routine but missing from the library. */
  missingExerciseIds: string[]
}
