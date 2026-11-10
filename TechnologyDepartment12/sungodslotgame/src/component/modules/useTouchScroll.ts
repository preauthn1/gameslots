// iOS 触屏设备在自定义滚动容器上原生 scroll 可能不触发，此处提供 JS 驱动滚动回退。
export function useTouchScroll() {
  const needsFallback = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)

  let touchStartY: number | null = null
  let touchStartScrollTop = 0

  function startTouchScroll(event: TouchEvent): void {
    if (!needsFallback || event.touches.length !== 1) return

    const container = event.currentTarget as HTMLElement
    if (container.scrollHeight <= container.clientHeight) return

    touchStartY = event.touches[0].clientY
    touchStartScrollTop = container.scrollTop
  }

  function moveTouchScroll(event: TouchEvent): void {
    if (!needsFallback || touchStartY === null || event.touches.length !== 1) return

    const container = event.currentTarget as HTMLElement
    const maxScrollTop = container.scrollHeight - container.clientHeight
    if (maxScrollTop <= 0) return

    const deltaY = touchStartY - event.touches[0].clientY
    container.scrollTop = Math.min(maxScrollTop, Math.max(0, touchStartScrollTop + deltaY))
    if (event.cancelable) event.preventDefault()
  }

  function endTouchScroll(): void {
    touchStartY = null
  }

  return { startTouchScroll, moveTouchScroll, endTouchScroll }
}
