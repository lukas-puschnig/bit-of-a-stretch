/** Hash-based routing, which works on static hosting like GitHub Pages without rewrites. */

export type Route =
  | { name: 'home' }
  | { name: 'play'; routine: string }
  | { name: 'edit-routine'; routine?: string }
  | { name: 'exercises' }
  | { name: 'data' }

export function parseHash(hash: string): Route {
  const [first, second, third] = hash
    .replace(/^#\/?/, '')
    .split('/')
    .map((part) => decodeURIComponent(part))
  if (first === 'play' && second) return { name: 'play', routine: second }
  if (first === 'routines' && second === 'new') return { name: 'edit-routine' }
  if (first === 'routines' && second && third === 'edit') {
    return { name: 'edit-routine', routine: second }
  }
  if (first === 'exercises') return { name: 'exercises' }
  if (first === 'data') return { name: 'data' }
  return { name: 'home' }
}

export function href(route: Route): string {
  const enc = encodeURIComponent
  switch (route.name) {
    case 'home':
      return '#/'
    case 'play':
      return `#/play/${enc(route.routine)}`
    case 'edit-routine':
      return route.routine ? `#/routines/${enc(route.routine)}/edit` : '#/routines/new'
    case 'exercises':
      return '#/exercises'
    case 'data':
      return '#/data'
  }
}
