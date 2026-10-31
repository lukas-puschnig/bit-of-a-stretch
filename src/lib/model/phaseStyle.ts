import type { PhaseKind, Side } from './types'

export const PHASE_LABEL: Record<PhaseKind, string> = {
  prep: 'Vorbereitung',
  work: 'Übung',
  switch: 'Seitenwechsel',
  rest: 'Pause',
}

/** CSS custom property holding the phase color, see app.css. */
export const PHASE_COLOR: Record<PhaseKind, string> = {
  prep: 'var(--color-phase-prep)',
  work: 'var(--color-phase-work)',
  switch: 'var(--color-phase-switch)',
  rest: 'var(--color-phase-rest)',
}

export const SIDE_LABEL: Record<Side, string> = {
  left: 'Links',
  right: 'Rechts',
}
