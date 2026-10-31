import { describe, expect, it } from 'vitest'
import { buildPlan } from '../model/plan'
import type { Exercise, Routine } from '../model/types'
import { announcement } from './announcements'

const pigeon: Exercise = { id: 'pigeon', name: 'Taube', duration: 60, bilateral: true }
const frog: Exercise = { id: 'frog', name: 'Frosch', duration: 60, bilateral: false }
const library = new Map([pigeon, frog].map((e) => [e.id, e]))

const routine = (overrides: Partial<Routine> = {}): Routine => ({
  name: 'R',
  prepTime: 5,
  restTime: 12,
  entries: [{ exerciseId: 'frog' }, { exerciseId: 'pigeon' }],
  ...overrides,
})

/** Announcements for every phase start, in order. */
function script(r: Routine, locale: 'de' | 'en' = 'de') {
  const plan = buildPlan(r, library, 9)
  return plan.phases.map((p, index) => [
    p.kind,
    announcement({ type: 'phaseStart', index }, plan, locale),
  ])
}

describe('announcement', () => {
  it('announces upcoming exercises during prep and rest, and the side switch', () => {
    expect(script(routine())).toEqual([
      ['prep', 'Als Nächstes: Frosch'],
      ['work', undefined],
      ['rest', 'Als Nächstes: Taube, linke Seite'],
      ['work', undefined],
      ['switch', 'Seitenwechsel, rechte Seite'],
      ['work', undefined],
    ])
  })

  it('names the exercise at its start when nothing announced it', () => {
    expect(script(routine({ prepTime: 0, restTime: 0 }), 'en')).toEqual([
      ['work', 'Frosch'],
      ['work', 'Taube, left side'],
      ['switch', 'Switch sides, right side'],
      ['work', undefined],
    ])
  })

  it('says something at the end and stays silent on countdown beeps', () => {
    const plan = buildPlan(routine(), library, 9)
    expect(announcement({ type: 'finished' }, plan, 'de')).toBe('Geschafft. Gut gemacht!')
    expect(announcement({ type: 'countdown', secondsLeft: 3 }, plan, 'de')).toBeUndefined()
  })
})
