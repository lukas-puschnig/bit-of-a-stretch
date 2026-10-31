import type { Locale } from '../i18n/translate'

type Voice = Pick<SpeechSynthesisVoice, 'lang' | 'localService' | 'default'>

/**
 * Best installed voice for a language. On-device voices come first, because
 * network voices (e.g. Chrome's "Google" voices) send the text to a server.
 * Returns undefined rather than reading German with an English voice.
 */
export function pickVoice<V extends Voice>(voices: readonly V[], locale: Locale): V | undefined {
  const matching = voices.filter((v) => v.lang.toLowerCase().split(/[-_]/)[0] === locale)
  const score = (v: V) => (v.localService ? 2 : 0) + (v.default ? 1 : 0)
  return matching.sort((a, b) => score(b) - score(a))[0]
}

/** Spoken announcements via the browser's built-in speech synthesis. */
export class Announcer {
  private voices: SpeechSynthesisVoice[] = []
  private unlocked = false

  constructor() {
    if (!Announcer.supported) return
    this.loadVoices()
    // Most browsers load voices asynchronously.
    speechSynthesis.addEventListener('voiceschanged', this.loadVoices)
  }

  static get supported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /** iOS only speaks after speech was started from a user gesture once. */
  unlock() {
    if (!Announcer.supported || this.unlocked) return
    speechSynthesis.speak(new SpeechSynthesisUtterance(''))
    this.unlocked = true
  }

  /** Speaks `text`, replacing anything still being said. Returns false without a voice. */
  speak(text: string, locale: Locale): boolean {
    if (!Announcer.supported) return false
    const voice = pickVoice(this.voices, locale)
    if (!voice) return false
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    speechSynthesis.speak(utterance)
    return true
  }

  cancel() {
    if (Announcer.supported) speechSynthesis.cancel()
  }

  destroy() {
    this.cancel()
    if (Announcer.supported) speechSynthesis.removeEventListener('voiceschanged', this.loadVoices)
  }

  private loadVoices = () => {
    this.voices = speechSynthesis.getVoices()
  }
}
