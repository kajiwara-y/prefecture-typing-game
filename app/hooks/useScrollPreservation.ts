import { useEffect, useRef } from 'react'

export function useScrollPreservation() {
  const scrollPositionRef = useRef<number>(0)

  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY
  }

  const restoreScrollPosition = () => {
    window.scrollTo({
      top: scrollPositionRef.current,
      behavior: 'smooth'
    })
  }

  const preserveScrollDuring = (callback: () => void) => {
    saveScrollPosition()
    callback()
    // 次のフレームで復元
    requestAnimationFrame(() => {
      restoreScrollPosition()
    })
  }

  return {
    saveScrollPosition,
    restoreScrollPosition,
    preserveScrollDuring
  }
}
