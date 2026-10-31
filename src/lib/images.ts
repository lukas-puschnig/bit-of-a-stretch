import type { Exercise } from './model/types'

/**
 * Catalog images live in src/assets/exercises/<exercise-id>.<ext>. Vite picks up
 * whatever is there at build time, so adding an image needs no code change.
 */
const files = import.meta.glob<string>('../assets/exercises/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const catalogImages = new Map(
  Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
)

/** The exercise's own image, otherwise the bundled catalog image for its id. */
export function exerciseImage(exercise: Exercise | undefined): string | undefined {
  if (!exercise) return undefined
  const own = exercise.image
  if (!own) return catalogImages.get(exercise.id)
  // Relative paths point into public/ under the app's base URL.
  return /^(https?:|data:|blob:|\/)/.test(own) ? own : import.meta.env.BASE_URL + own
}
