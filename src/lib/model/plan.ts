import type { Exercise, Phase, Plan, ResolvedEntry, Routine, RoutineEntry } from './types'

export function resolveEntry(
  entry: RoutineEntry,
  exercise: Exercise,
  routine: Routine,
  defaultSwitchTime: number,
  index: number,
): ResolvedEntry {
  const duration = entry.duration ?? exercise.duration
  const switchTime = exercise.bilateral
    ? (entry.switchTime ?? exercise.switchTime ?? defaultSwitchTime)
    : 0
  return {
    index,
    exercise,
    duration,
    bilateral: exercise.bilateral,
    switchTime,
    restAfter: entry.restAfter ?? routine.restTime,
    totalDuration: exercise.bilateral ? 2 * duration + switchTime : duration,
  }
}

/** Total time of a single exercise on its own, as shown in the library. */
export function exerciseTotalDuration(exercise: Exercise, defaultSwitchTime: number): number {
  if (!exercise.bilateral) return exercise.duration
  return 2 * exercise.duration + (exercise.switchTime ?? defaultSwitchTime)
}

/**
 * Flattens a routine into the sequence of phases the timer plays:
 * prep, then per entry work (or left, switch, right), then rest between entries.
 * Phases with zero duration are left out; no rest follows the last entry.
 */
export function buildPlan(
  routine: Routine,
  exercises: ReadonlyMap<string, Exercise>,
  defaultSwitchTime: number,
): Plan {
  const entries: ResolvedEntry[] = []
  const missingExerciseIds: string[] = []

  for (const entry of routine.entries) {
    const exercise = exercises.get(entry.exerciseId)
    if (!exercise) {
      missingExerciseIds.push(entry.exerciseId)
      continue
    }
    entries.push(resolveEntry(entry, exercise, routine, defaultSwitchTime, entries.length))
  }

  const phases: Phase[] = []
  let clock = 0
  const push = (phase: Omit<Phase, 'start'>) => {
    if (phase.duration <= 0) return
    phases.push({ ...phase, start: clock })
    clock += phase.duration
  }

  if (entries.length > 0) push({ kind: 'prep', duration: routine.prepTime, entryIndex: 0 })

  for (const entry of entries) {
    const entryIndex = entry.index
    if (entry.bilateral) {
      push({ kind: 'work', duration: entry.duration, entryIndex, side: 'left' })
      push({ kind: 'switch', duration: entry.switchTime, entryIndex, side: 'right' })
      push({ kind: 'work', duration: entry.duration, entryIndex, side: 'right' })
    } else {
      push({ kind: 'work', duration: entry.duration, entryIndex })
    }
    const isLast = entryIndex === entries.length - 1
    if (!isLast) push({ kind: 'rest', duration: entry.restAfter, entryIndex: entryIndex + 1 })
  }

  return { entries, phases, totalDuration: clock, missingExerciseIds }
}
