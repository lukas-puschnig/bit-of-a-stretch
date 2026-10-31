import { describe, expect, it } from 'vitest'
import { buildPlan, exerciseTotalDuration } from './plan'
import type { Exercise, Routine } from './types'

const pancake: Exercise = { id: 'pancake', name: 'Pancake', duration: 60, bilateral: false }
const pigeon: Exercise = { id: 'pigeon', name: 'Pigeon', duration: 45, bilateral: true }
const lunge: Exercise = {
  id: 'lunge',
  name: 'Lunge',
  duration: 30,
  bilateral: true,
  switchTime: 8,
}
const library = new Map([pancake, pigeon, lunge].map((e) => [e.id, e]))

function routine(overrides: Partial<Routine> = {}): Routine {
  return {
    name: 'Test',
    prepTime: 10,
    restTime: 15,
    entries: [{ exerciseId: 'pancake' }, { exerciseId: 'pigeon' }],
    ...overrides,
  }
}

describe('buildPlan', () => {
  it('expands bilateral exercises into left, switch and right', () => {
    const plan = buildPlan(routine(), library, 5)
    expect(plan.phases.map((p) => [p.kind, p.duration, p.entryIndex, p.side])).toEqual([
      ['prep', 10, 0, undefined],
      ['work', 60, 0, undefined],
      ['rest', 15, 1, undefined],
      ['work', 45, 1, 'left'],
      ['switch', 5, 1, 'right'],
      ['work', 45, 1, 'right'],
    ])
  })

  it('computes start offsets and total duration', () => {
    const plan = buildPlan(routine(), library, 5)
    expect(plan.phases.map((p) => p.start)).toEqual([0, 10, 70, 85, 130, 135])
    expect(plan.totalDuration).toBe(180)
  })

  it('applies entry overrides before exercise and routine defaults', () => {
    const plan = buildPlan(
      routine({
        entries: [
          { exerciseId: 'lunge', duration: 20, switchTime: 3, restAfter: 0 },
          { exerciseId: 'pancake' },
        ],
      }),
      library,
      5,
    )
    expect(plan.entries[0]).toMatchObject({ duration: 20, switchTime: 3, restAfter: 0 })
    expect(plan.entries[0]?.totalDuration).toBe(43)
    expect(plan.phases.some((p) => p.kind === 'rest')).toBe(false)
  })

  it('prefers the exercise switch time over the global default', () => {
    const plan = buildPlan(routine({ entries: [{ exerciseId: 'lunge' }] }), library, 5)
    expect(plan.entries[0]?.switchTime).toBe(8)
  })

  it('skips zero-length phases', () => {
    const plan = buildPlan(routine({ prepTime: 0, restTime: 0 }), library, 0)
    expect(plan.phases.map((p) => p.kind)).toEqual(['work', 'work', 'work'])
  })

  it('drops entries whose exercise is missing and reports them', () => {
    const plan = buildPlan(
      routine({ entries: [{ exerciseId: 'ghost' }, { exerciseId: 'pancake' }] }),
      library,
      5,
    )
    expect(plan.missingExerciseIds).toEqual(['ghost'])
    expect(plan.entries).toHaveLength(1)
    expect(plan.entries[0]?.index).toBe(0)
  })

  it('returns an empty plan for an empty routine', () => {
    const plan = buildPlan(routine({ entries: [] }), library, 5)
    expect(plan.phases).toEqual([])
    expect(plan.totalDuration).toBe(0)
  })
})

describe('exerciseTotalDuration', () => {
  it('counts both sides plus the switch for bilateral exercises', () => {
    expect(exerciseTotalDuration(pigeon, 5)).toBe(95)
    expect(exerciseTotalDuration(lunge, 5)).toBe(68)
    expect(exerciseTotalDuration(pancake, 5)).toBe(60)
  })
})
