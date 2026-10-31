/** Transient UI state shared across views. */
class UiState {
  menuOpen = $state(false)
}

export const ui = new UiState()
