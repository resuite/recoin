import { createScope, useObserver } from 'retend'
import { Flags } from '@/constants/flags'
import { clamp, type ElementRef } from '@/utilities/miscellaneous'
import { GESTURE_ANIMATION_MS } from '@/utilities/scrolling'

interface AnimationData {
   animation: Animation
   start: number
   end: number
}

interface ScrollTimelineContext {
   source: ElementRef
   add: (animation: ScrollLinkedAnimationOptions) => void
   lock: () => void
   unlock: () => void
}

interface ScrollLinkedAnimationRange {
   start?: number
   end?: number
}

interface ScrollLinkedAnimationOptions {
   target: ElementRef
   keyframes: Array<Keyframe> | PropertyIndexedKeyframes
   range?: ScrollLinkedAnimationRange
   pseudoElement?: ':before' | ':after'
   signal?: AbortSignal
}

export const ScrollTimelineScope = createScope<ScrollTimelineContext>('ScrollView')

export function useTimelineSetup(containerRef: ElementRef, axis: ScrollTimelineAxis) {
   const observer = useObserver()
   const scrollAnimations: Array<AnimationData> = []
   const hasScrollTimelineSupport = Flags.Runtime.Supports.ScrollTimeline
   let timeline: ScrollTimeline | null = null

   function addLinkedAnimation(animation: ScrollLinkedAnimationOptions) {
      const { target, keyframes, range, signal, pseudoElement = null } = animation

      observer.onConnected(target, (element) => {
         const start = range?.start ?? 0
         const end = range?.end ?? 1

         const animation = hasScrollTimelineSupport
            ? element.animate(keyframes, {
                 timeline,
                 rangeStart: `${start * 100}%`,
                 rangeEnd: `${end * 100}%`,
                 fill: 'both',
                 easing: 'linear',
                 pseudoElement
              })
            : element.animate(keyframes, {
                 fill: 'both',
                 easing: 'linear',
                 duration: GESTURE_ANIMATION_MS,
                 pseudoElement
              })

         if (!hasScrollTimelineSupport) {
            animation.pause()
            const animationData = {
               animation,
               start: start * GESTURE_ANIMATION_MS,
               end: end * GESTURE_ANIMATION_MS
            }
            scrollAnimations.push(animationData)
         }

         const cleanup = () => {
            animation.finish()
            try {
               animation.timeline = null
               // may fail on firefox
            } catch {}
            if (!hasScrollTimelineSupport) {
               const index = scrollAnimations.findIndex((animationData) => {
                  return animationData.animation === animation
               })
               scrollAnimations.splice(index, 1)
            }
         }

         signal?.addEventListener('abort', cleanup)
         return cleanup
      })
   }

   function scrollFallbackListenerBlock(this: HTMLElement) {
      if (scrollAnimations.length === 0) {
         return
      }
      const { scrollTop, scrollHeight, clientHeight } = this
      const scrollProgress = scrollTop / (scrollHeight - clientHeight)

      for (const { animation, start, end } of scrollAnimations) {
         const rangeStart = start / GESTURE_ANIMATION_MS
         const rangeEnd = end / GESTURE_ANIMATION_MS
         const progress = clamp((scrollProgress - rangeStart) / (rangeEnd - rangeStart), 0, 1)
         animation.currentTime = progress * GESTURE_ANIMATION_MS
      }
   }

   function scrollFallbackListenerInline(this: HTMLElement) {
      if (scrollAnimations.length === 0) {
         return
      }

      const { scrollLeft, scrollWidth, clientWidth } = this
      const scrollProgress = scrollLeft / (scrollWidth - clientWidth)

      for (const { animation, start, end } of scrollAnimations) {
         const rangeStart = start / GESTURE_ANIMATION_MS
         const rangeEnd = end / GESTURE_ANIMATION_MS
         const progress = clamp((scrollProgress - rangeStart) / (rangeEnd - rangeStart), 0, 1)
         animation.currentTime = progress * GESTURE_ANIMATION_MS
      }
   }

   const ctx: ScrollTimelineContext = {
      source: containerRef,
      add: addLinkedAnimation,
      lock() {
         const container = containerRef.peek()
         container?.style.setProperty('overflow', 'hidden')
      },
      unlock() {
         const container = containerRef.peek()
         container?.style.removeProperty('overflow')
      }
   }

   observer.onConnected(containerRef, (container) => {
      if (hasScrollTimelineSupport) {
         timeline = new ScrollTimeline({ source: container, axis })
         return
      }
      const scrollListener =
         axis === 'block' ? scrollFallbackListenerBlock : scrollFallbackListenerInline
      container.addEventListener('scroll', scrollListener, { passive: true })

      return () => {
         container.removeEventListener('scroll', scrollListener)
      }
   })

   return ctx
}
