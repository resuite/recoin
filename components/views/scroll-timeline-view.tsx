import { GESTURE_ANIMATION_MS } from '@/utilities/scrolling'
import { Cell, createScope, useObserver, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import classes from './scroll-timeline-view.module.css'

declare global {
   // The types are not yet bundled with typescript.
   type ScrollTimelineAxis = 'inline' | 'block'
   class ScrollTimeline extends AnimationTimeline {
      constructor(options: { source: Element; axis: ScrollTimelineAxis })
      readonly source: Element
      readonly axis: ScrollTimelineAxis
   }
   interface KeyframeAnimationOptions {
      rangeStart?: string
      rangeEnd?: string
   }
}

interface ScrollLinkedAnimationRange {
   start: number
   end: number
}

interface AnimationData {
   animation: Animation
   start: number
   end: number
}

interface ScrollLinkedAnimationOptions {
   target: Cell<HTMLElement | null>
   keyframes: Array<Keyframe> | PropertyIndexedKeyframes
   range?: ScrollLinkedAnimationRange
   signal?: AbortSignal
}

interface ScrollTimelineContext {
   source: Cell<HTMLElement | null>
   add: (animation: ScrollLinkedAnimationOptions) => void
}
const ScrollTimelineScope = createScope<ScrollTimelineContext>('ScrollTimelineView')

type DivProps = JSX.IntrinsicElements['div']
interface ScrollTimelineViewProps extends DivProps {
   axis: ScrollTimelineAxis
   children: () => JSX.Template
   ref?: Cell<HTMLDivElement | null>
}

/**
 * Creates a scrollable container that enables scroll-linked animations on its children.
 * It provides a context that allows descendant components to synchronize animations
 * with the scroll position of this container.
 *
 * @param props - The props for the component.
 * @returns The rendered `ScrollTimelineView` component.
 */
export function ScrollTimelineView(props: ScrollTimelineViewProps) {
   const { axis, children, ref: containerRef = Cell.source(null), ...rest } = props
   const observer = useObserver()

   const scrollAnimations: Array<AnimationData> = []
   let hasScrollTimelineSupport = false
   let timeline: ScrollTimeline | null = null

   const addLinkedAnimation = (animation: ScrollLinkedAnimationOptions) => {
      const { target, keyframes, range, signal } = animation

      observer.onConnected(target, (element) => {
         const start = range?.start ?? 0
         const end = range?.end ?? 1

         const animation = hasScrollTimelineSupport
            ? element.animate(keyframes, {
                 timeline,
                 rangeStart: `${start * 100}%`,
                 rangeEnd: `${end * 100}%`,
                 fill: 'both',
                 easing: 'linear'
              })
            : element.animate(keyframes, {
                 fill: 'both',
                 easing: 'linear',
                 duration: GESTURE_ANIMATION_MS + 1
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
      const { scrollTop, scrollHeight, clientHeight } = this
      const newTime = (scrollTop / (scrollHeight - clientHeight)) * GESTURE_ANIMATION_MS
      for (const { animation, start, end } of scrollAnimations) {
         if (newTime >= start && newTime <= end) {
            const progress = (newTime - start) / (end - start)
            animation.currentTime = progress * GESTURE_ANIMATION_MS
         }
      }
   }

   function scrollFallbackListenerInline(this: HTMLElement) {
      const { scrollLeft, scrollWidth, clientWidth } = this
      const newTime = (scrollLeft / (scrollWidth - clientWidth)) * GESTURE_ANIMATION_MS
      for (const { animation, start, end } of scrollAnimations) {
         if (newTime >= start && newTime <= end) {
            const progress = (newTime - start) / (end - start)
            animation.currentTime = progress * GESTURE_ANIMATION_MS
         }
      }
   }

   const ctx: ScrollTimelineContext = {
      source: containerRef,
      add: addLinkedAnimation
   }

   observer.onConnected(containerRef, (container) => {
      hasScrollTimelineSupport = 'ScrollTimeline' in window
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

   return (
      <ScrollTimelineScope.Provider value={ctx}>
         {() => (
            <div
               {...rest}
               ref={containerRef}
               data-scroll-axis={axis}
               class={[rest.class, classes.container]}
            >
               {children?.()}
            </div>
         )}
      </ScrollTimelineScope.Provider>
   )
}

export function useScrollTimelineContext() {
   return useScopeContext(ScrollTimelineScope)
}
