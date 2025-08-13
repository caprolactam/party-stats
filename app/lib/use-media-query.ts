/**
 * Forked from juliencrn/usehooks-ts
 * - https://usehooks-ts.com/react-hook/use-media-query
 * - MIT https://github.com/juliencrn/usehooks-ts/blob/master/LICENSE
 *
 * replace useEffect with useSyncExternalStore
 */

import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string, defaultMatches = false): boolean {
  function subscribe(callback: () => void): () => void {
    const matchMedia = window.matchMedia(query)

    // Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener
    if (matchMedia.addListener) {
      matchMedia.addListener(callback)
    }
    else {
      matchMedia.addEventListener('change', callback)
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(callback)
      }
      else {
        matchMedia.removeEventListener('change', callback)
      }
    }
  }

  function getSnapshot(): boolean {
    const matchMedia = window.matchMedia(query)
    return matchMedia.matches
  }

  const isMatched = useSyncExternalStore<boolean>(
    subscribe,
    getSnapshot,
    () => defaultMatches,
  )

  return isMatched
}

export function useIsMobile(defaultMatches = false) {
  return useMediaQuery('(max-width: 640px)', defaultMatches)
}
