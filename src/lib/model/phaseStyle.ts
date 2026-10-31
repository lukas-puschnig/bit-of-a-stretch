import type { PhaseKind } from './types'

/** CSS custom property holding the phase color, see app.css. */
export const PHASE_COLOR: Record<PhaseKind, string> = {
  prep: 'var(--color-phase-prep)',
  work: 'var(--color-phase-work)',
  switch: 'var(--color-phase-switch)',
  rest: 'var(--color-phase-rest)',
}
