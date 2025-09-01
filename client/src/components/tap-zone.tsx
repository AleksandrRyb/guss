import { memo, useCallback, useRef } from 'react'

export interface TapZoneProps {
  isEnabled: boolean
  onTap: () => void
}

export const TAP_ANIMATION_MS = 600 as const

export const TapZone = memo(function TapZone({ isEnabled, onTap }: TapZoneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handlePointer = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return
    onTap()
    const root = containerRef.current
    if (!root) return
    const el = document.createElement('div')
    el.textContent = '+1'
    el.className = 'absolute text-primary -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-100 transition-opacity duration-300'
    const point = 'clientX' in event ? { x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY } : { x: (event as React.TouchEvent).touches[0].clientX, y: (event as React.TouchEvent).touches[0].clientY }
    const rect = root.getBoundingClientRect()
    el.style.left = `${point.x}px`
    el.style.top = `${point.y}px`
    if (point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom) {
      return
    }
    root.appendChild(el)
    requestAnimationFrame(() => {
      el.style.opacity = '0'
    })
    setTimeout(() => {
      if (root.contains(el)) root.removeChild(el)
    }, TAP_ANIMATION_MS)
  }, [isEnabled, onTap])

  return (
    <div ref={containerRef} className="relative p-4 flex items-center justify-center select-none">
      <div
        role="button"
        aria-label="Tap zone"
        className="w-[min(600px,90vw)] h-[min(50vh,60vw)] bg-accent/30 rounded-md border flex items-center justify-center"
        onClick={handlePointer}
        onTouchStart={handlePointer}
      >
        <div className="text-4xl opacity-70">🦢</div>
      </div>
    </div>
  )
})


