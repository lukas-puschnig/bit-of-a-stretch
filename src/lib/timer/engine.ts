import type { Phase } from '../model/types'

/**
 * Pure timer state machine over a flat list of phases.
 * Time is tracked in milliseconds; phase durations are in seconds.
 */

export type TimerStatus = 'ready' | 'running' | 'paused' | 'finished'

export interface TimerState {
  readonly index: number
  readonly elapsedInPhase: number
  readonly status: TimerStatus
}

export type TimerEvent =
  | { type: 'countdown'; secondsLeft: number }
  | { type: 'phaseStart'; index: number }
  | { type: 'finished' }

export interface TickResult {
  state: TimerState
  events: TimerEvent[]
}

/** Seconds before the end of a phase at which a countdown event fires. */
export const COUNTDOWN_SECONDS = [3, 2, 1] as const

/** Pressing "previous" later than this into a phase restarts it instead. */
export const RESTART_THRESHOLD_MS = 3000

export const initialState: TimerState = { index: 0, elapsedInPhase: 0, status: 'ready' }

const phaseMs = (phase: Phase | undefined) => (phase ? phase.duration * 1000 : 0)

export function tick(state: TimerState, phases: readonly Phase[], deltaMs: number): TickResult {
  if (state.status !== 'running' || deltaMs <= 0) return { state, events: [] }

  const events: TimerEvent[] = []
  let index = state.index
  let elapsed = state.elapsedInPhase
  let budget = deltaMs

  while (budget > 0) {
    const duration = phaseMs(phases[index])
    const before = duration - elapsed
    const step = Math.min(budget, before)
    elapsed += step
    budget -= step
    const after = duration - elapsed

    for (const s of COUNTDOWN_SECONDS) {
      const at = s * 1000
      if (before > at && after <= at) events.push({ type: 'countdown', secondsLeft: s })
    }

    if (after > 0) break

    if (index >= phases.length - 1) {
      events.push({ type: 'finished' })
      return { state: { index, elapsedInPhase: duration, status: 'finished' }, events }
    }
    index += 1
    elapsed = 0
    events.push({ type: 'phaseStart', index })
  }

  return { state: { index, elapsedInPhase: elapsed, status: 'running' }, events }
}

export function play(state: TimerState, phases: readonly Phase[]): TimerState {
  if (phases.length === 0) return state
  if (state.status === 'finished') return { ...initialState, status: 'running' }
  return { ...state, status: 'running' }
}

export function pause(state: TimerState): TimerState {
  return state.status === 'running' ? { ...state, status: 'paused' } : state
}

export function toggle(state: TimerState, phases: readonly Phase[]): TimerState {
  return state.status === 'running' ? pause(state) : play(state, phases)
}

/** Jumps to the start of a phase; keeps running if it was running. */
export function jumpTo(state: TimerState, phases: readonly Phase[], index: number): TimerState {
  if (phases.length === 0) return state
  const clamped = Math.max(0, Math.min(index, phases.length - 1))
  const status = state.status === 'finished' ? 'paused' : state.status
  return { index: clamped, elapsedInPhase: 0, status }
}

export function next(state: TimerState, phases: readonly Phase[]): TimerState {
  if (state.index >= phases.length - 1) {
    return { index: state.index, elapsedInPhase: phaseMs(phases[state.index]), status: 'finished' }
  }
  return jumpTo(state, phases, state.index + 1)
}

/** Restarts the current phase, or goes back one phase if it has only just started. */
export function previous(state: TimerState, phases: readonly Phase[]): TimerState {
  const restart = state.elapsedInPhase > RESTART_THRESHOLD_MS || state.index === 0
  return jumpTo(state, phases, restart ? state.index : state.index - 1)
}

export function phaseRemainingMs(state: TimerState, phases: readonly Phase[]): number {
  return Math.max(0, phaseMs(phases[state.index]) - state.elapsedInPhase)
}

export function totalElapsedMs(state: TimerState, phases: readonly Phase[]): number {
  const phase = phases[state.index]
  return phase ? phase.start * 1000 + state.elapsedInPhase : 0
}
