import { Cell, useObserver } from 'retend'
import { useScrollState } from '@/utilities/composables/use-scroll-state'
import { watchTouchGesture } from '@/utilities/pointer-gesture-tracker'
import { debouncedFlag, type ElementRef } from '../miscellaneous'

const MAX_STRETCH_SCALE = 1.0375
const STRETCH_Y = { scale: ['1', `1 ${MAX_STRETCH_SCALE}`] }
const STRETCH_X = { scale: ['1', `1 ${MAX_STRETCH_SCALE} 1`] }
const STRETCH_Y_RELEASE = [
   { scale: '1' },
   { scale: `1 ${MAX_STRETCH_SCALE}`, offset: 0.1 },
   { scale: '1' }
]
const OVERSCROLL_EFFECT_DURATION = 300
const OVERSCROLL_OPTIONS: KeyframeAnimationOptions = {
   composite: 'replace',
   duration: OVERSCROLL_EFFECT_DURATION,
   easing: 'linear'
}

interface OverScrollEffectOptions {
   containerRef: ElementRef
   axis: ScrollTimelineAxis
   isEnabled?: boolean
}

export function useOverScrollEffect(options: OverScrollEffectOptions) {
   const { axis, containerRef, isEnabled = true } = options
   let cancelLastOverscrollEffect: null | (() => void)
   const observer = useObserver()
   const isBlock = axis === 'block'
   const state = useScrollState(containerRef)
   let totalSize = 0

   const overScrollAreaIsActive = Cell.derived(() => {
      if (isBlock) {
         const scrollToTop = state.atTop.get()
         const scrolledToBottom = state.atBottom.get()
         return scrollToTop || scrolledToBottom
      }
      const scrolledToLeft = state.atLeft.get()
      const scrolledToRight = state.atRight.get()
      return scrolledToLeft || scrolledToRight
   })

   function startDragEffect(this: HTMLElement, event: TouchEvent) {
      const nearestScrollView = event.composedPath().find((target) => {
         return target instanceof HTMLElement && target.hasAttribute('data-scroll-axis')
      })
      if (nearestScrollView !== this) {
         return
      }
      const keyframe = isBlock ? STRETCH_Y : STRETCH_X
      const baseAnimation = this.animate(keyframe, OVERSCROLL_OPTIONS)
      baseAnimation.currentTime = 0
      baseAnimation.pause()

      cancelLastOverscrollEffect = watchTouchGesture(event, {
         onMove: (deltaX, deltaY) => {
            const delta = isBlock ? deltaY : deltaX
            const forwards = delta > 0
            let transformOrigin = forwards ? 'top center' : 'bottom center'
            if (!isBlock) {
               transformOrigin = forwards ? 'center left' : 'center right'
            }
            const absDelta = forwards ? delta : -delta
            const nextFrameTime = (absDelta / totalSize) * OVERSCROLL_EFFECT_DURATION
            this.style.transformOrigin = transformOrigin
            baseAnimation.currentTime = nextFrameTime
         },
         onEnd: () => {
            cancelLastOverscrollEffect = null
            if (baseAnimation.currentTime === 0) {
               baseAnimation.finish()
               return
            }
            baseAnimation.reverse()
            baseAnimation.play()
         }
      })
   }

   const trail = {
      top: debouncedFlag(50),
      bottom: debouncedFlag(50)
   }
   function checkOverscrollThreshold(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('top-threshold')) {
         trail.top.value = true
         trail.bottom.value = false
      } else if (event.animationName.includes('bottom-threshold')) {
         trail.bottom.value = true
         trail.top.value = false
      }
   }

   overScrollAreaIsActive.listen((shouldEnable) => {
      if (!shouldEnable || !isEnabled) {
         return
      }
      const container = containerRef.peek()
      if (!container) {
         return
      }
      if (isBlock) {
         const topTrailingEffect = trail.top.value && state.atTop.get()
         const bottomTrailingEffect = trail.bottom.value && state.atBottom.get()
         if (topTrailingEffect || bottomTrailingEffect) {
            container.style.transformOrigin = topTrailingEffect ? 'top center' : 'bottom center'
            container.animate(STRETCH_Y_RELEASE, OVERSCROLL_OPTIONS)
         }
      }
   })

   overScrollAreaIsActive.runAndListen((shouldEnable) => {
      if (!isEnabled) {
         return
      }
      cancelLastOverscrollEffect?.()
      const container = containerRef.peek()
      if (!shouldEnable) {
         container?.removeEventListener('touchstart', startDragEffect)
      } else {
         container?.addEventListener('touchstart', startDragEffect, { passive: true })
      }
   })

   observer.onConnected(containerRef, (container) => {
      totalSize = isBlock ? container.clientHeight : container.clientWidth
      const resizeObserver = new ResizeObserver(([entry]) => {
         totalSize = isBlock ? entry.contentRect.height : entry.contentRect.width
      })
      resizeObserver.observe(container)
      container.addEventListener('animationstart', checkOverscrollThreshold)

      return () => {
         container.removeEventListener('animationstart', checkOverscrollThreshold)
         resizeObserver.disconnect()
      }
   })
}
