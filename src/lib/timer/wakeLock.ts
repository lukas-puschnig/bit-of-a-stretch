/**
 * Keeps the screen on while enabled. The browser drops the lock whenever the
 * page is hidden, so it is requested again when the page becomes visible.
 */
export class ScreenWakeLock {
  private sentinel: WakeLockSentinel | undefined
  private wanted = false

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  get supported() {
    return 'wakeLock' in navigator
  }

  async enable() {
    this.wanted = true
    await this.request()
  }

  async disable() {
    this.wanted = false
    const sentinel = this.sentinel
    this.sentinel = undefined
    await sentinel?.release()
  }

  async destroy() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    await this.disable()
  }

  private async request() {
    if (!this.supported || this.sentinel || document.visibilityState !== 'visible') return
    try {
      this.sentinel = await navigator.wakeLock.request('screen')
      this.sentinel.addEventListener('release', () => (this.sentinel = undefined))
    } catch {
      // Denied, e.g. by battery saver. The timer works without it.
    }
  }

  private onVisibilityChange = () => {
    if (this.wanted && document.visibilityState === 'visible') void this.request()
  }
}
