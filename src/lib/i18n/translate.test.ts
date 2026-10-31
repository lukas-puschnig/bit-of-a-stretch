import { describe, expect, it } from 'vitest'
import { de, en } from './messages'
import { detectLocale, translate, translateCount } from './translate'

describe('translate', () => {
  it('fills in parameters and leaves unknown ones alone', () => {
    expect(translate('de', 'player.position', { current: 3, total: 6 })).toBe('3 von 6')
    expect(translate('en', 'player.position', { current: 3 })).toBe('3 of {total}')
  })

  it('picks singular and plural forms', () => {
    expect(translateCount('de', 'count.exercises', 1)).toBe('1 Übung')
    expect(translateCount('en', 'count.exercises', 4)).toBe('4 exercises')
  })

  it('uses the same placeholders in every language', () => {
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    for (const key of Object.keys(de) as (keyof typeof de)[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(de[key]))
    }
  })
})

describe('detectLocale', () => {
  it('matches the first supported base language', () => {
    expect(detectLocale(['fr-FR', 'de-AT', 'en'])).toBe('de')
    expect(detectLocale(['en-GB'])).toBe('en')
    expect(detectLocale(['fr'])).toBe('en')
  })
})
