import { describe, expect, it } from 'vitest'
import { href, parseHash, type Route } from './routes'

describe('routes', () => {
  const routes: Route[] = [
    { name: 'home' },
    { name: 'play', routine: 'Hüfte & Beine' },
    { name: 'edit-routine' },
    { name: 'edit-routine', routine: 'A/B' },
    { name: 'exercises' },
    { name: 'data' },
  ]

  it.each(routes)('round-trips %o', (route) => {
    expect(parseHash(href(route))).toEqual(route)
  })

  it('falls back to home for unknown hashes', () => {
    expect(parseHash('#/nope')).toEqual({ name: 'home' })
    expect(parseHash('')).toEqual({ name: 'home' })
  })
})
