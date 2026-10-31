import type { Phase, Plan, ResolvedEntry } from '../model/types'
import * as engine from './engine'
import type { TimerEvent, TimerState } from './engine'

/** Larger frame gaps mean the tab was hidden; countdown beeps would be stale then. */
const STALE_FRAME_MS = 1000

/** Reactive wrapper that drives the pure timer engine with animation frames. */
export class Player {
  state = $state<TimerState>(engine.initialState)

  readonly plan: Plan
  private readonly onEvent: (event: TimerEvent, phase: Phase | undefined) => void
  private frame: number | undefined
  private lastTime = 0

  get phase(): Phase | undefined {
    return this.plan.phases[this.state.index]
  }

  get entry(): ResolvedEntry | undefined {
    const phase = this.phase
    return phase && this.plan.entries[phase.entryIndex]
  }

  get remainingMs() {
    return engine.phaseRemainingMs(this.state, this.plan.phases)
  }

  get elapsedMs() {
    return engine.totalElapsedMs(this.state, this.plan.phases)
  }

  get running() {
    return this.state.status === 'running'
  }

  constructor(plan: Plan, onEvent: (event: TimerEvent, phase: Phase | undefined) => void) {
    this.plan = plan
    this.onEvent = onEvent
  }

  toggle() {
    this.update(engine.toggle(this.state, this.plan.phases))
  }

  pause() {
    this.update(engine.pause(this.state))
  }

  next() {
    this.update(engine.next(this.state, this.plan.phases))
  }

  previous() {
    this.update(engine.previous(this.state, this.plan.phases))
  }

  jumpToEntry(entryIndex: number) {
    const index = this.plan.phases.findIndex(
      (p) => p.entryIndex === entryIndex && p.kind === 'work',
    )
    if (index >= 0) this.update(engine.jumpTo(this.state, this.plan.phases, index))
  }

  destroy() {
    this.stopLoop()
  }

  private update(state: TimerState) {
    const previous = this.state
    this.state = state
    // Starting fresh counts as entering the first phase, so it gets its signal too.
    const fresh = previous.status === 'ready' || previous.status === 'finished'
    if (state.status === 'running' && (state.index !== previous.index || fresh)) {
      this.emit({ type: 'phaseStart', index: state.index })
    }
    if (state.status === 'finished' && previous.status !== 'finished') {
      this.emit({ type: 'finished' })
    }
    if (state.status === 'running') this.startLoop()
    else this.stopLoop()
  }

  private emit(event: TimerEvent) {
    const index = event.type === 'phaseStart' ? event.index : this.state.index
    this.onEvent(event, this.plan.phases[index])
  }

  private startLoop() {
    if (this.frame !== undefined) return
    this.lastTime = performance.now()
    this.frame = requestAnimationFrame(this.loop)
  }

  private stopLoop() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame)
    this.frame = undefined
  }

  private loop = (now: number) => {
    const delta = now - this.lastTime
    this.lastTime = now
    const { state, events } = engine.tick(this.state, this.plan.phases, delta)
    this.state = state
    const stale = delta > STALE_FRAME_MS
    for (const event of events) {
      if (!(stale && event.type === 'countdown')) this.emit(event)
    }
    this.frame = state.status === 'running' ? requestAnimationFrame(this.loop) : undefined
  }
}
