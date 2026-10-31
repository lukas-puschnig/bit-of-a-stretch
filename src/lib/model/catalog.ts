import catalog from '../../data/catalog.json'
import { LOCALES, type Locale } from '../i18n/translate'
import type { Exercise, Routine } from './types'
import { parseLibrary, type Library } from './validation'

type Localized = Record<Locale, string>

/** Replaces every `{ de, en }` object with the text for `locale`. */
function localize(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((v) => localize(v, locale))
  if (typeof value !== 'object' || value === null) return value
  if ('de' in value && 'en' in value) return (value as Localized)[locale]
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, locale)]))
}

/** Built-in exercises and sample routines, validated like an import. */
export function sampleLibrary(locale: Locale): Library {
  return parseLibrary(localize(catalog, locale))
}

/** Catalog exercises whose id is not in `existing`. */
export function missingCatalogExercises(existing: Iterable<string>, locale: Locale): Exercise[] {
  const ids = new Set(existing)
  return sampleLibrary(locale).exercises.filter((e) => !ids.has(e.id))
}

/** Sample routines whose name, in any language, is not in `existing`. */
export function missingCatalogRoutines(existing: Iterable<string>, locale: Locale): Routine[] {
  const names = new Set(existing)
  const translations = LOCALES.map((l) => sampleLibrary(l).routines)
  return sampleLibrary(locale).routines.filter(
    (_, i) => !translations.some((routines) => names.has(routines[i]!.name)),
  )
}
