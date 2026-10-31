import type { MessageKey } from './messages'
import {
  detectLocale,
  translate,
  translateCount,
  type Locale,
  type MessageParams,
  type PluralKey,
} from './translate'

class I18n {
  locale = $state<Locale>(detectLocale())
}

export const i18n = new I18n()

/** Reactive in templates because it reads `i18n.locale`. */
export const t = (key: MessageKey, params?: MessageParams) => translate(i18n.locale, key, params)

export const tc = (key: PluralKey, count: number) => translateCount(i18n.locale, key, count)
