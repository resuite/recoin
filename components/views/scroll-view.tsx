import { Cell, createScope, useObserver, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { Flags } from '@/constants/flags'
import { Platform } from '@/utilities/browser'
import { clamp, defer } from '@/utilities/miscellaneous'
import { watchTouchGesture } from '@/utilities/pointer-gesture-tracker'
import { GESTURE_ANIMATION_MS } from '@/utilities/scrolling'
import classes from './scroll-view.module.css'

type ContainerRef = Cell<HTMLElement | null>

interface ScrollLinkedAnimationRange {
   start?: number
   end?: number
}

interface AnimationData {
   animation: Animation
   start: number
   end: number
}

interface ScrollLinkedAnimationOptions {
   target: ContainerRef
   keyframes: Array<Keyframe> | PropertyIndexedKeyframes
   range?: ScrollLinkedAnimationRange
   pseudoElement?: ':before' | ':after'
   signal?: AbortSignal
}

interface ScrollTimelineContext {
   source: ContainerRef
   add: (animation: ScrollLinkedAnimationOptions) => void
   lock: () => void
   unlock: () => void
}

interface ScrollState {
   scrolledToTop: Cell<boolean>
   scrolledToBottom: Cell<boolean>
   scrolledToLeft: Cell<boolean>
   scrolledToRight: Cell<boolean>
}

const ScrollTimelineScope = createScope<ScrollTimelineContext>('ScrollView')
const MAX_STRETCH = GESTURE_ANIMATION_MS / 2
const OVERSCROLL_OPTIONS: KeyframeAnimationOptions = {
   composite: 'replace',
   duration: GESTURE_ANIMATION_MS,
   easing: 'linear'
}
const STRETCH_Y = { scale: ['1 1', '1 1.075'] }
const STRETCH_X = { scale: ['1 1', '1.075 1'] }

type DivProps = JSX.IntrinsicElements['div']
interface ScrollViewProps extends DivProps {
   axis?: ScrollTimelineAxis
   children: () => JSX.Template
   ref?: Cell<HTMLElement | null>
}

interface CustomOverScrollEffectOptions {
   containerRef: ContainerRef
   axis: ScrollTimelineAxis
   isEnabled: boolean
}

/**
 * Creates a scrollable container that enables scroll-linked animations on its children.
 * It provides a context that allows descendant components to synchronize animations
 * with the scroll position of this container.
 *
 * @param props - The props for the component.
 * @returns The rendered `ScrollView` component.
 */
export function ScrollView(props: ScrollViewProps) {
   const { axis = 'block', children, ref: containerRef = Cell.source(null), ...rest } = props
   const ctx = useTimelineSetup(containerRef, axis)
   useCustomOverScrollEffect({
      containerRef,
      axis,
      isEnabled: Flags.OS.Name === Platform.Android
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

function useScrollState(containerRef: ContainerRef): ScrollState {
   const scrolledToTop = Cell.source(false)
   const scrolledToBottom = Cell.source(false)
   const scrolledToLeft = Cell.source(false)
   const scrolledToRight = Cell.source(false)
   const observer = useObserver()

   if (!Flags.Runtime.Supports.ScrollTimeline) {
      return {
         scrolledToTop: scrolledToTop,
         scrolledToBottom: scrolledToBottom,
         scrolledToLeft: scrolledToLeft,
         scrolledToRight: scrolledToRight
      }
   }

   function handleAnimationStart(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('scrolled-to-top-detector')) {
         scrolledToTop.set(true)
      } else if (event.animationName.includes('scrolled-to-bottom-detector')) {
         scrolledToBottom.set(true)
      } else if (event.animationName.includes('scrolled-to-left-detector')) {
         scrolledToLeft.set(true)
      } else if (event.animationName.includes('scrolled-to-right-detector')) {
         scrolledToRight.set(true)
      }
   }

   function handleAnimationEnd(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('scrolled-to-top-detector')) {
         scrolledToTop.set(false)
      } else if (event.animationName.includes('scrolled-to-bottom-detector')) {
         scrolledToBottom.set(false)
      } else if (event.animationName.includes('scrolled-to-left-detector')) {
         scrolledToLeft.set(false)
      } else if (event.animationName.includes('scrolled-to-right-detector')) {
         scrolledToRight.set(false)
      }
   }

   observer.onConnected(containerRef, (container) => {
      container.addEventListener('animationstart', handleAnimationStart)
      container.addEventListener('animationend', handleAnimationEnd)

      return () => {
         container.removeEventListener('animationstart', handleAnimationStart)
         container.removeEventListener('animationend', handleAnimationEnd)
      }
   })

   return { scrolledToTop, scrolledToBottom, scrolledToLeft, scrolledToRight }
}

function useCustomOverScrollEffect(options: CustomOverScrollEffectOptions) {
   const { axis, containerRef, isEnabled } = options
   let cancelLastOverscrollEffect: null | (() => void)
   const isBlock = axis === 'block'
   const state = useScrollState(containerRef)
   const shouldEnableListener = Cell.derived(() => {
      if (isBlock) {
         const scrollToTop = state.scrolledToTop.get()
         const scrolledToBottom = state.scrolledToBottom.get()
         return scrollToTop || scrolledToBottom
      }
      const scrolledToLeft = state.scrolledToLeft.get()
      const scrolledToRight = state.scrolledToRight.get()
      return scrolledToLeft || scrolledToRight
   })

   function startEffect(this: HTMLElement, event: TouchEvent) {
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
            if (nextFrameTime <= MAX_STRETCH) {
               overscrollAnimation.currentTime = nextFrameTime
            }
         },
         onEnd: () => {
            overscrollAnimation.commitStyles()
            overscrollAnimation.finish()
            requestAnimationFrame(() => {
               requestAnimationFrame(() => {
                  this.style.removeProperty('scale')
                  this.style.removeProperty('will-change')
               })
            })
         }
      })
   }

   shouldEnableListener.runAndListen((shouldEnable) => {
      if (!isEnabled) {
         return
      }
      cancelLastOverscrollEffect?.()
      const container = containerRef.peek()
      defer(() => {
         if (!shouldEnable) {
            container?.removeEventListener('touchstart', startEffect)
         } else {
            container?.addEventListener('touchstart', startEffect, { passive: true })
         }
      })
   })
}

function useTimelineSetup(containerRef: ContainerRef, axis: ScrollTimelineAxis) {
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

export function useScrollTimeline() {
   return useScopeContext(ScrollTimelineScope)
}
