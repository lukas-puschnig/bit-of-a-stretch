import { describe, expect, it } from 'vitest'
import { pickVoice } from './speech'

const voice = (lang: string, localService: boolean, isDefault = false) => ({
  lang,
  localService,
  default: isDefault,
})

describe('pickVoice', () => {
  it('prefers on-device voices of the right language', () => {
    const remote = voice('de-DE', false, true)
    const local = voice('de-AT', true)
    expect(pickVoice([voice('en-US', true), remote, local], 'de')).toBe(local)
  })

  it('accepts underscores and falls back to network voices', () => {
    const remote = voice('en_GB', false)
    expect(pickVoice([voice('de-DE', true), remote], 'en')).toBe(remote)
  })

  it('returns nothing when no voice speaks the language', () => {
    expect(pickVoice([voice('en-US', true)], 'de')).toBeUndefined()
  })
})
