import { Cell, useObserver } from 'retend'
import { useScrollState } from '@/utilities/composables/use-scroll-state'
import { watchTouchGesture } from '@/utilities/pointer-gesture-tracker'
import { GESTURE_ANIMATION_MS } from '@/utilities/scrolling'
import { type ContainerRef, debouncedFlag } from '../miscellaneous'

const OVERSCROLL_OPTIONS: KeyframeAnimationOptions = {
   composite: 'replace',
   duration: GESTURE_ANIMATION_MS,
   easing: 'linear'
}
const STRETCH_Y = { scale: ['1', '1 1.0375'] }
const STRETCH_X = { scale: ['1', '1.0375 1'] }
const STRETCH_Y_RELEASE = [{ scale: '1 1.03' }, { scale: '1' }]

interface CustomOverScrollEffectOptions {
   containerRef: ContainerRef
   axis: ScrollTimelineAxis
   isEnabled?: boolean
}

export function useOverScrollEffect(options: CustomOverScrollEffectOptions) {
   const { axis, containerRef, isEnabled = true } = options
   let cancelLastOverscrollEffect: null | (() => void)
   const observer = useObserver()
   const isBlock = axis === 'block'
   const state = useScrollState(containerRef)
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
      const totalSize = isBlock ? this.clientHeight : this.clientWidth
      const keyframe = isBlock ? STRETCH_Y : STRETCH_X
      const overscrollAnimation = this.animate(keyframe, OVERSCROLL_OPTIONS)
      overscrollAnimation.currentTime = 0
      overscrollAnimation.pause()

      cancelLastOverscrollEffect = watchTouchGesture(event, {
         onMove: (deltaX, deltaY) => {
            const delta = isBlock ? deltaY : deltaX
            const forwards = delta > 0
            let transformOrigin = forwards ? 'top center' : 'bottom center'
            if (!isBlock) {
               transformOrigin = forwards ? 'center left' : 'center right'
            }
            const absDelta = forwards ? delta : -delta
            const nextFrameTime = (absDelta / totalSize) * GESTURE_ANIMATION_MS
            this.style.transformOrigin = transformOrigin
            this.style.willChange = 'scale'
            overscrollAnimation.currentTime = nextFrameTime
         },
         onEnd: () => {
            overscrollAnimation.commitStyles()
            overscrollAnimation.finish()
            cancelLastOverscrollEffect = null
            requestAnimationFrame(() => {
               requestAnimationFrame(() => {
                  this.style.removeProperty('scale')
                  this.style.removeProperty('will-change')
               })
            })
         }
      })
   }

   const thresholdTrackers = {
      top: debouncedFlag(50),
      bottom: debouncedFlag(50)
   }
   function checkOverscrollThreshold(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('top-threshold')) {
         thresholdTrackers.top.value = true
         thresholdTrackers.bottom.value = false
      } else if (event.animationName.includes('bottom-threshold')) {
         thresholdTrackers.bottom.value = true
         thresholdTrackers.top.value = false
      }
   }

   overScrollAreaIsActive.listen((shouldEnable) => {
      if (!shouldEnable) {
         return
      }
      const container = containerRef.peek()
      if (!container) {
         return
      }
      if (isBlock) {
         const momentumBounceTop = state.atTop.get() && thresholdTrackers.top.value
         container.style.transformOrigin = momentumBounceTop ? 'top center' : 'bottom center'
         container.animate(STRETCH_Y_RELEASE, { ...OVERSCROLL_OPTIONS, duration: 300 })
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
      container.addEventListener('animationstart', checkOverscrollThreshold)

      return () => {
         container.removeEventListener('animationstart', checkOverscrollThreshold)
      }
   })
}
