const LONG_PRESS_DELAY = 500
const MOVE_THRESHOLD = 10

const polyfillStates = new WeakMap<Element, PolyfillState>()

interface PolyfillState {
   handleTouchStart: EventListener
   handleTouchMove: EventListener
   handleTouchEnd: EventListener
}

export function polyfillTouchContextMenuEvent(element: Element): void {
   if (!element || !(element instanceof Element)) {
      throw new Error('Invalid element provided')
   }

   if (polyfillStates.has(element)) {
      return
   }

   let touchStartX = 0
   let touchStartY = 0
   let longPressTimer: NodeJS.Timeout | null = null

   const handleTouchStart = (event: Event) => {
      const touchEvent = event as TouchEvent
      if (touchEvent.touches.length !== 1) {
         return
      }
      const touch = touchEvent.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      longPressTimer = setTimeout(() => {
         const contextEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 2,
            buttons: 2
         })
         element.dispatchEvent(contextEvent)
      }, LONG_PRESS_DELAY)
   }

   const handleTouchMove = (event: Event) => {
      if (!longPressTimer) {
         return
      }
      const touchEvent = event as TouchEvent
      const touch = touchEvent.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartX)
      const deltaY = Math.abs(touch.clientY - touchStartY)
      if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
         clearTimeout(longPressTimer)
         longPressTimer = null
      }
   }

   const handleTouchEnd = () => {
      if (longPressTimer) {
         clearTimeout(longPressTimer)
         longPressTimer = null
      }
   }

   element.addEventListener('touchstart', handleTouchStart, { passive: true })
   element.addEventListener('touchmove', handleTouchMove, { passive: true })
   element.addEventListener('touchend', handleTouchEnd, { passive: true })
   element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

   polyfillStates.set(element, {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
   })
}

export function removeTouchContextMenuEventPolyfill(element: Element): void {
   const state = polyfillStates.get(element)
   if (!state) {
      return
   }

   element.removeEventListener('touchstart', state.handleTouchStart)
   element.removeEventListener('touchmove', state.handleTouchMove)
   element.removeEventListener('touchend', state.handleTouchEnd)
   element.removeEventListener('touchcancel', state.handleTouchEnd)

   polyfillStates.delete(element)
}
