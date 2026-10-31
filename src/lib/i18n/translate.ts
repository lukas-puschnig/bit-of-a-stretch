import { de, en, type MessageKey } from './messages'

export const LOCALES = ['de', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type MessageParams = Record<string, string | number>

const catalogs: Record<Locale, Record<MessageKey, string>> = { de, en }

/** Keys that come in `.one` / `.other` variants, e.g. `count.exercises`. */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer Base}.one` ? Base : never
}[MessageKey]

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const template = catalogs[locale][key]
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

/** Picks the singular or plural form and fills in `{count}`. */
export function translateCount(locale: Locale, key: PluralKey, count: number): string {
  return translate(locale, `${key}.${count === 1 ? 'one' : 'other'}`, { count })
}

export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    const match = LOCALES.find((l) => l === base)
    if (match) return match
  }
  return 'en'
}
