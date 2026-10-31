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

  finished() {
    this.play(
      { frequency: 660, duration: 0.18 },
      { frequency: 880, duration: 0.18, at: 0.2 },
      { frequency: 1320, duration: 0.5, at: 0.4, volume: 0.35 },
    )
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
