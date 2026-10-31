import type { PhaseKind } from '../model/types'

interface Tone {
  frequency: number
  duration: number
  /** Delay from now, in seconds. */
  at?: number
  volume?: number
}

/**
 * Short synthesized signals via the Web Audio API, so no audio files are needed.
 * Browsers only allow audio after a user gesture, so call `unlock()` from one.
 */
export class Beeper {
  private context: AudioContext | undefined

  unlock() {
    this.context ??= new AudioContext()
    if (this.context.state === 'suspended') void this.context.resume()
  }

  countdown() {
    this.play({ frequency: 660, duration: 0.12 })
  }

  phaseStart(kind: PhaseKind) {
    switch (kind) {
      case 'work':
        this.play({ frequency: 990, duration: 0.4, volume: 0.35 })
        break
      case 'switch':
        this.play({ frequency: 780, duration: 0.12 }, { frequency: 780, duration: 0.12, at: 0.18 })
        break
      case 'rest':
      case 'prep':
        this.play({ frequency: 520, duration: 0.35 })
        break
    }
  }

  /** A soft gong: inharmonic partials that ring out, higher ones fading faster. */
  gong() {
    const ctx = this.context
    if (!ctx || ctx.state !== 'running') return
    const base = 196
    const partials = [
      { ratio: 1, volume: 0.32, decay: 4.5 },
      { ratio: 2.76, volume: 0.16, decay: 3 },
      { ratio: 5.4, volume: 0.08, decay: 1.8 },
      { ratio: 8.93, volume: 0.04, decay: 1 },
    ]
    const start = ctx.currentTime + 0.02
    for (const { ratio, volume, decay } of partials) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = base * ratio
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(volume, start + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + decay)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + decay)
    }
  }

  private play(...tones: Tone[]) {
    const ctx = this.context
    if (!ctx || ctx.state !== 'running') return
    for (const { frequency, duration, at = 0, volume = 0.25 } of tones) {
      const start = ctx.currentTime + at
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = frequency
      // Short attack and release avoid audible clicks.
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(volume, start + 0.01)
      gain.gain.setValueAtTime(volume, start + duration - 0.03)
      gain.gain.linearRampToValueAtTime(0, start + duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + duration)
    }
  }
}
