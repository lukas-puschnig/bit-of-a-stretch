import { describe, expect, it } from 'vitest'
import { createId, formatClock, formatCountdown, formatDuration } from './format'

describe('format', () => {
  it('formats clock times', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(75)).toBe('1:15')
    expect(formatClock(3725)).toBe('1:02:05')
  })

  it('formats countdowns', () => {
    expect(formatCountdown(9)).toBe('9')
    expect(formatCountdown(90)).toBe('1:30')
  })

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 s')
    expect(formatDuration(120)).toBe('2 min')
    expect(formatDuration(90)).toBe('1:30 min')
  })

  it('creates readable ids', () => {
    expect(createId('Hüft-Öffner Übung')).toMatch(/^huft-offner-ubung-[a-z0-9]+$/)
    expect(createId('!!!')).toMatch(/^[a-z0-9]+$/)
  })
})
