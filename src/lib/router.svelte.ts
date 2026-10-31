import { href, parseHash, type Route } from './routes'

export { href, type Route }

class Router {
  route = $state<Route>(parseHash(location.hash))

  constructor() {
    window.addEventListener('hashchange', () => (this.route = parseHash(location.hash)))
  }

  go(route: Route, { replace = false } = {}) {
    if (replace) {
      history.replaceState(null, '', href(route))
      this.route = route
    } else {
      location.hash = href(route)
    }
  }
}

export const router = new Router()
