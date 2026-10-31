import { describe, expect, it } from 'vitest'
import { LOCALES } from '../i18n/translate'
import { missingCatalogExercises, sampleLibrary } from './catalog'
import { TIMING } from './types'

describe.each(LOCALES)('sample library (%s)', (locale) => {
  const library = sampleLibrary(locale)

  it('only references existing exercises', () => {
    const ids = new Set(library.exercises.map((e) => e.id))
    for (const routine of library.routines) {
      for (const entry of routine.entries) expect(ids).toContain(entry.exerciseId)
    }
  })

  it('gives every exercise a category and a stepper-friendly duration', () => {
    for (const exercise of library.exercises) {
      expect(exercise.category, exercise.id).toBeDefined()
      expect(exercise.duration % TIMING.duration.step, exercise.id).toBe(0)
    }
  })

  it('is localized', () => {
    expect(library.exercises.find((e) => e.id === 'childs-pose')?.name).toBe(
      locale === 'de' ? 'Kindhaltung' : "Child's pose",
    )
  })
})

describe('missingCatalogExercises', () => {
  it('returns only exercises that are not there yet', () => {
    const all = sampleLibrary('en').exercises
    const missing = missingCatalogExercises(
      all.slice(1).map((e) => e.id),
      'en',
    )
    expect(missing).toEqual([all[0]])
  })
})
