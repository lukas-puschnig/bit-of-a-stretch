import type { Exercise } from './model/types'
import { library } from './stores/library.svelte'

/**
 * Catalog images live in src/assets/exercises/<exercise-id>.<ext>. Vite picks up
 * whatever is there at build time, so adding an image needs no code change.
 */
const files = import.meta.glob<string>('../assets/exercises/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** A real picture replaces the generated SVG placeholder with the same id. */
const PRIORITY = ['svg', 'jpeg', 'jpg', 'png', 'webp']
const rank = (path: string) => PRIORITY.indexOf(path.split('.').pop() ?? '')

const catalogImages = new Map(
  Object.entries(files)
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
)

/** The exercise's own image, otherwise the bundled catalog image for its id. */
export function exerciseImage(
  exercise: Exercise | undefined,
  enabled = library.settings.showImages,
): string | undefined {
  if (!exercise || !enabled) return undefined
  const own = exercise.image
  if (!own) return catalogImages.get(exercise.id)
  // Relative paths point into public/ under the app's base URL.
  return /^(https?:|data:|blob:|\/)/.test(own) ? own : import.meta.env.BASE_URL + own
}
