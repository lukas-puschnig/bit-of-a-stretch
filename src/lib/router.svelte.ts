import { href, parseHash, type Route } from './routes'

export { href, type Route }

/** Returns false to keep the user on the current page. */
export type LeaveGuard = () => boolean

class Router {
  route = $state<Route>(parseHash(location.hash))
  private guard: LeaveGuard | undefined

  constructor() {
    window.addEventListener('hashchange', () => {
      const next = parseHash(location.hash)
      if (this.guard && !this.guard()) {
        // Links and the back button have already changed the hash; put it back.
        history.replaceState(null, '', href(this.route))
        return
      }
      this.guard = undefined
      this.route = next
    })
  }

  go(route: Route, { replace = false } = {}) {
    if (replace) {
      history.replaceState(null, '', href(route))
      this.route = route
    } else {
      location.hash = href(route)
    }
  }

  /** Asks `guard` before any navigation away from the current page; returns the cleanup. */
  guardLeave(guard: LeaveGuard): () => void {
    this.guard = guard
    return () => {
      if (this.guard === guard) this.guard = undefined
    }
  }
}

export const router = new Router()
