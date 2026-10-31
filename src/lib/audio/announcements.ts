import type { MessageKey } from '../i18n/messages'
import { translate, type Locale } from '../i18n/translate'
import type { Plan } from '../model/types'
import type { TimerEvent } from '../timer/engine'

/**
 * What to say for a timer event, or nothing. Exercises are announced during
 * the prep or rest before them, so the start of the stretch itself stays quiet.
 */
export function announcement(event: TimerEvent, plan: Plan, locale: Locale): string | undefined {
  const say = (key: MessageKey, name?: string) => translate(locale, key, name ? { name } : {})

  if (event.type === 'finished') return say('voice.done')
  if (event.type !== 'phaseStart') return undefined

  const phase = plan.phases[event.index]
  const entry = phase && plan.entries[phase.entryIndex]
  if (!phase || !entry) return undefined
  const name = entry.exercise.name

  switch (phase.kind) {
    case 'prep':
    case 'rest':
      return say(entry.bilateral ? 'voice.nextLeft' : 'voice.next', name)
    case 'switch':
      return say('voice.switch')
    case 'work': {
      // Only when no prep or rest announced it, e.g. with zero rest between exercises.
      const before = plan.phases[event.index - 1]
      if (before && before.kind !== 'work') return undefined
      return say(phase.side === 'left' ? 'voice.nowLeft' : 'voice.now', name)
    }
  }
}
