/** Next multiple of `step` above `value`, so odd values snap onto the grid. */
export function stepUp(value: number, step: number): number {
  return Math.floor(value / step) * step + step
}

/** Previous multiple of `step` below `value`, never dropping below `min`. */
export function stepDown(value: number, step: number, min = 0): number {
  const next = Math.ceil(value / step) * step - step
  // Values already below the minimum stay put instead of jumping up.
  return next < min ? Math.min(value, min) : next
}
