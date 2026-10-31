import { describe, expect, it } from 'vitest'
import type { Phase } from '../model/types'
import {
  initialState,
  jumpTo,
  next,
  pause,
  phaseRemainingMs,
  play,
  previous,
  tick,
  toggle,
  totalElapsedMs,
  type TimerState,
} from './engine'

const phases: Phase[] = [
  { kind: 'prep', duration: 5, start: 0, entryIndex: 0 },
  { kind: 'work', duration: 10, start: 5, entryIndex: 0 },
  { kind: 'rest', duration: 4, start: 15, entryIndex: 1 },
  { kind: 'work', duration: 10, start: 19, entryIndex: 1 },
]

const running = (index = 0, elapsedInPhase = 0): TimerState => ({
  index,
  elapsedInPhase,
  status: 'running',
})

describe('tick', () => {
  it('does nothing unless running', () => {
    expect(tick(initialState, phases, 1000)).toEqual({ state: initialState, events: [] })
    const paused = pause(running(1, 500))
    expect(tick(paused, phases, 1000).state).toBe(paused)
  })

  it('advances time within a phase', () => {
    const { state, events } = tick(running(1, 1000), phases, 2500)
    expect(state).toEqual(running(1, 3500))
    expect(events).toEqual([])
  })

  it('emits countdown events when crossing the last three seconds', () => {
    const { events } = tick(running(1, 6500), phases, 1000)
    expect(events).toEqual([{ type: 'countdown', secondsLeft: 3 }])
    const { events: more } = tick(running(1, 6900), phases, 2000)
    expect(more).toEqual([
      { type: 'countdown', secondsLeft: 3 },
      { type: 'countdown', secondsLeft: 2 },
    ])
  })

  it('moves to the next phase and carries over remaining time', () => {
    const { state, events } = tick(running(0, 3500), phases, 2200)
    expect(state).toEqual(running(1, 700))
    expect(events).toEqual([
      { type: 'countdown', secondsLeft: 1 },
      { type: 'phaseStart', index: 1 },
    ])
  })

  it('can skip several phases in one large step', () => {
    const { state, events } = tick(running(0, 0), phases, 16_000)
    expect(state).toEqual(running(2, 1000))
    expect(events.filter((e) => e.type === 'phaseStart')).toEqual([
      { type: 'phaseStart', index: 1 },
      { type: 'phaseStart', index: 2 },
    ])
  })

  it('finishes at the end of the last phase', () => {
    const { state, events } = tick(running(3, 9000), phases, 5000)
    expect(state).toEqual({ index: 3, elapsedInPhase: 10_000, status: 'finished' })
    expect(events.at(-1)).toEqual({ type: 'finished' })
  })
})

describe('controls', () => {
  it('toggles between running and paused', () => {
    const started = toggle(initialState, phases)
    expect(started.status).toBe('running')
    expect(toggle(started, phases).status).toBe('paused')
  })

  it('does not start an empty plan', () => {
    expect(play(initialState, [])).toBe(initialState)
  })

  it('restarts from the beginning when playing a finished timer', () => {
    const finished: TimerState = { index: 3, elapsedInPhase: 10_000, status: 'finished' }
    expect(play(finished, phases)).toEqual(running(0, 0))
  })

  it('next jumps to the start of the following phase and keeps the status', () => {
    expect(next(running(1, 4000), phases)).toEqual(running(2, 0))
    expect(next(pause(running(1, 4000)), phases).status).toBe('paused')
  })

  it('next on the last phase finishes', () => {
    expect(next(running(3, 1000), phases)).toEqual({
      index: 3,
      elapsedInPhase: 10_000,
      status: 'finished',
    })
  })

  it('previous restarts the phase after the threshold, otherwise goes back', () => {
    expect(previous(running(2, 3500), phases)).toEqual(running(2, 0))
    expect(previous(running(2, 1000), phases)).toEqual(running(1, 0))
    expect(previous(running(0, 1000), phases)).toEqual(running(0, 0))
  })

  it('previous from a finished timer leaves it paused', () => {
    const finished: TimerState = { index: 3, elapsedInPhase: 10_000, status: 'finished' }
    expect(previous(finished, phases)).toEqual({ index: 3, elapsedInPhase: 0, status: 'paused' })
  })

  it('jumpTo clamps the index', () => {
    expect(jumpTo(initialState, phases, 99).index).toBe(3)
    expect(jumpTo(initialState, phases, -1).index).toBe(0)
  })
})

describe('progress', () => {
  it('reports remaining and total elapsed time', () => {
    const state = running(2, 1500)
    expect(phaseRemainingMs(state, phases)).toBe(2500)
    expect(totalElapsedMs(state, phases)).toBe(16_500)
  })
})
