/** 75 → "1:15", 3725 → "1:02:05" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = String(s % 60).padStart(2, '0')
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`
}

/** Countdown digits: plain seconds below a minute, otherwise m:ss. */
export function formatCountdown(seconds: number): string {
  return seconds < 60 ? String(seconds) : formatClock(seconds)
}

/** 45 → "45 s", 90 → "1:30 min", 1200 → "20 min" */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} s`
  if (totalSeconds % 60 === 0) return `${totalSeconds / 60} min`
  return `${formatClock(totalSeconds)} min`
}

export function createId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  // randomUUID needs a secure context, which a phone on the LAN dev server is not.
  const suffix = Math.random().toString(36).slice(2, 8)
  return slug ? `${slug}-${suffix}` : suffix
}
