import { describe, expect, it } from 'vitest'
import { stepDown, stepUp } from './step'

describe('stepUp / stepDown', () => {
  it('moves by one step on the grid', () => {
    expect(stepUp(45, 15)).toBe(60)
    expect(stepDown(45, 15)).toBe(30)
  })

  it('snaps values between grid points', () => {
    expect(stepUp(40, 15)).toBe(45)
    expect(stepDown(40, 15)).toBe(30)
    expect(stepUp(5, 3)).toBe(6)
    expect(stepDown(5, 3)).toBe(3)
  })

  it('respects the minimum', () => {
    expect(stepDown(15, 15, 15)).toBe(15)
    expect(stepDown(2, 3)).toBe(0)
    expect(stepDown(0, 3)).toBe(0)
    expect(stepDown(10, 15, 15)).toBe(10)
  })
})
