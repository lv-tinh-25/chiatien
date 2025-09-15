'use client'

import { create } from 'zustand'

type NavigationState = {
  /** The path the app was on before the current one, within this session. */
  previous: string | null
  current: string | null
  visit: (path: string) => void
}

/**
 * Where the app came from, which the browser will not tell us: `document
 * .referrer` is not updated by a client-side navigation and `history.state`
 * carries nothing we set.
 *
 * A form uses it to decide how to leave. Replacing the form with the screen it
 * returns to leaves a duplicate of that screen in the history whenever the
 * screen is also the entry underneath, and after a few expenses the back button
 * walks through a run of identical pages. Knowing the previous path lets the
 * form step back over itself instead.
 *
 * Not persisted: it describes this tab's history, and a reload starts a new one.
 */
export const useNavigationStore = create<NavigationState>()((set) => ({
  previous: null,
  current: null,
  visit: (path) =>
    set((state) =>
      state.current === path
        ? state
        : { previous: state.current, current: path },
    ),
}))
