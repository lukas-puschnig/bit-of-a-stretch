import type { ThemePreference } from './model/types'

/**
 * Mirrors the theme preference in localStorage so the inline script in
 * index.html can apply it before the app (and IndexedDB) has loaded.
 */
export const THEME_STORAGE_KEY = 'theme'

const darkQuery = () => matchMedia('(prefers-color-scheme: dark)')

function resolve(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference
  return darkQuery().matches ? 'dark' : 'light'
}

function apply(preference: ThemePreference) {
  const root = document.documentElement
  root.dataset.theme = resolve(preference)
  const background = getComputedStyle(root).getPropertyValue('--color-bg').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
}

/** Applies the preference and follows OS changes while it is "system". Returns a cleanup. */
export function useTheme(preference: ThemePreference): () => void {
  apply(preference)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Storage blocked; the theme still applies for this session.
  }
  if (preference !== 'system') return () => {}
  const query = darkQuery()
  const onChange = () => apply(preference)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
