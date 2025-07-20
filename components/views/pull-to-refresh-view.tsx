import {
   PointerTracker,
   type TrackedMoveEvent
} from '@/utilities/pointer-gesture-tracker'
import { GESTURE_ANIMATION_MS, getScrollableY } from '@/utilities/scrolling'
import { Cell, type SourceCell, useObserver } from 'retend'
import {
   useDerivedValue,
   useIntersectionObserver,
   useMatchMedia,
   useWindowSize
} from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './pull-to-refresh-view.module.css'

export type PullState =
   | 'thresholdreached'
   | 'pulling'
   | 'idle'
   | 'actiontriggered'

type DivProps = JSX.IntrinsicElements['div']
export interface PullToRefreshViewProps extends DivProps {
   /**
    * The content to be rendered in the feedback layer behind the scrollable content.
    */
   feedback?: () => JSX.Template
   /**
    * A callback function that is invoked when the user completes a pull-down.
    * It is expected to return a Promise that resolves when a given action is complete.
    */
   onActionTriggered?: () => Promise<void>
   /**
    * A callback function that is invoked when the state of the pull-zone changes.
    */
   onStateChange?: (state: PullState) => void
   /**
    * A ref to the underlying HTML element of the pull zone.
    */
   ref?: SourceCell<HTMLElement | null>
   /**
    * Classes to be applied to the content element.
    */
   'content:class'?: unknown
   /**
    * A ref to a top marker in a scrollable content element.
    * This is used to determine when the pull-to-refresh can be triggered, which
    * will be when this marker is visible.
    */
   contentTopMarker?: SourceCell<HTMLElement | null>
   /**
    * An external Cell to hold whether the pull-to-refresh
    * should be allowed to trigger.
    */
   allowPull?: JSX.ValueOrCell<boolean>
}

/**
 * Provides a "pull-to-refresh" or "pull-to-action" functionality.
 * It wraps content in a scrollable view. When the user pulls down from the top of this
 * content, a feedback area is revealed, and if pulled beyond a defined threshold,
 * an action is triggered.
 *
 * The component manages various states of the pull interaction, such as "pulling",
 * "thresholdreached", and "actiontriggered", and provides callbacks for these state changes.
 * It requires touch input (pointer: coarse) to enable the pull gesture.
 *
 * @param {PullToRefreshViewProps} props - The properties to configure the PullToRefreshView component.
 * @example
 * ```tsx
 * function App() {
 *   const handleRefresh = async () => {
 *     console.log("Refresh action triggered")
 *     await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate async action
 *     console.log("Refresh action complete")
 *   }
 *
 *   const handleStateChange = (state) => {
 *     console.log("PullToRefreshView state:", state)
 *   }
 *
 *   const FeedbackContent = () => {
 *     return (
 *       <div style={{ padding: '20px', textAlign: 'center' }}>
 *         Pulling to refresh...
 *       </div>
 *     )
 *   }
 *
 *   return (
 *     <PullToRefreshView
 *       onStateChange={handleStateChange}
 *       onActionTriggered={handleRefresh}
 *       feedback={FeedbackContent}
 *       style={{ height: '300px', border: '1px solid #ccc' }}
 *       content:class="my-custom-content-styles"
 *     >
 *       <div style={{ height: '200px', backgroundColor: '#ccc' }}>
 *         <p>Scrollable content goes here.</p>
 *         <p>Pull down to refresh.</p>
 *         {Array.from({ length: 20 }, (_, i) => <p key={i}>Item {i + 1}</p>)}
 *       </div>
 *     </PullToRefreshView>
 *   )
 * }
 * ```
 */
export function PullToRefreshView(props: PullToRefreshViewProps): JSX.Template {
   const {
      children,
      feedback,
      onActionTriggered,
      onStateChange,
      ref: pullZoneRef = Cell.source(null),
      'content:class': contentClasses,
      contentTopMarker: contentTopMarkerProp,
      allowPull: allowPullProp = Cell.source(true),
      ...rest
   } = props
   const contentRef = Cell.source<HTMLElement | null>(null)
   const scrollContainerRef = Cell.source<HTMLElement | null>(null)
   const thresholdMarkerRef = Cell.source<HTMLElement | null>(null)
   const feedbackLayerRef = Cell.source<HTMLElement | null>(null)
   const contentTopMarkerRef =
      contentTopMarkerProp ?? Cell.source<HTMLElement | null>(null)
   const observer = useObserver()
   const supportsTouch = useMatchMedia('(pointer: coarse)')
   const { height } = useWindowSize()
   const reachedTop = Cell.source(false)
   const allowPull = useDerivedValue(allowPullProp)
   const canPull = Cell.derived(() => {
      return (
         // allowPull can be undefined.
         reachedTop.get() && supportsTouch.get() && allowPull.get() !== false
      )
   })
   let scrollable: HTMLElement | null = null

   let pullState: PullState = 'idle'
   let feedbackLayerIsVisible = false
   let thresholdMarkerIsVisible = false
   let pullZoneHeight = 0
   let pullScrollAnimation: Animation | null = null
   let tracker: PointerTracker | null = null

   const getPullToRefreshElement = () => {
      return pullZoneRef.peek() as HTMLElement
   }

   const changeState = (newState: PullState) => {
      pullState = newState
      onStateChange?.(pullState)
   }

   const handleCustomPullStart = (_event: Event) => {
      if (pullState === 'actiontriggered') {
         return
      }
      const event = _event as PullStartEvent
      tracker = event.pointerTracker
      const originalPointerEvent = tracker.startingEvent
      startGesture(originalPointerEvent)
      tracker.addEventListener('move', processGesture)
      tracker.addEventListener('end', endGesture)
      tracker.addEventListener('cancel', endGesture)
   }

   const handlePointerDown = (event: PointerEvent) => {
      if (pullState === 'actiontriggered') {
         return
      }
      tracker = new PointerTracker()
      tracker.start(event)
      startGesture(event)
      tracker.addEventListener('move', processGesture)
      tracker.addEventListener('end', endGesture)
      tracker.addEventListener('cancel', endGesture)
   }

   const processGesture = (event: TrackedMoveEvent) => {
      requestAnimationFrame(() => {
         const delta = event.deltaY
         if (delta < 0) {
            if (!scrollable || delta > -30) {
               return
            }
            scrollable.scrollTop = -delta
            return
         }
         if (pullScrollAnimation === null) {
            return
         }
         const newTime = (delta / pullZoneHeight) * GESTURE_ANIMATION_MS
         pullScrollAnimation.currentTime = Math.min(
            newTime,
            MAX_PULL_ZONE_SCROLL_TOP
         )
      })
   }

   const startGesture = (event: PointerEvent) => {
      const pullZone = getPullToRefreshElement()
      const pointerOriginTarget = event.target as HTMLElement
      scrollable = getScrollableY(pointerOriginTarget, pullZone)

      pullZone.classList.add(styles.pullZoneDragging as string)
      pullZoneHeight = pullZone.clientHeight

      pullScrollAnimation = pullZone.animate(KEYFRAMES, ANIMATION_OPTIONS)
      pullScrollAnimation.pause()
   }

   const endGesture = () => {
      pullScrollAnimation?.play()
      pullScrollAnimation = null
      scrollable = null
      const pullZone = getPullToRefreshElement()
      pullZone.classList.remove(styles.pullZoneDragging as string)
      triggerAction()
   }

   const triggerAction = async () => {
      const pullZone = getPullToRefreshElement()
      if (thresholdMarkerIsVisible) {
         changeState('actiontriggered')
         pullZone.classList.add(styles.pullZoneActionTriggered as string)
         navigator.vibrate?.([15, 15])
         await onActionTriggered?.()
      }
      pullZone.classList.remove(styles.pullZoneActionTriggered as string)
      changeState('idle')
   }

   // No, scrollend didn't work.
   //
   // CSS Scroll snaps have become untenable, so we have to
   // implement something a bit more manual. There are two
   // intersection observers, one tracking the feedback layer,
   // another tracking the threshold marker.
   //
   // - If the feedback layer is visible, but not the threshold marker,
   // it means the user is pulling. On touchend/scrollend we "snap" back to
   // the content.
   //
   // - If the threshold marker is visible, then we are ready for a pull
   // release and an action trigger. On touchend, we "snap" to
   // the feedback layer.
   useIntersectionObserver(
      thresholdMarkerRef,
      ([entry]) => {
         if (entry === undefined) {
            return
         }
         thresholdMarkerIsVisible = entry.isIntersecting
         if (thresholdMarkerIsVisible) {
            changeState('thresholdreached')
         } else if (pullState !== 'actiontriggered' && pullState !== 'idle') {
            changeState('pulling')
         }
      },
      () => {
         return { root: pullZoneRef.peek(), threshold: 0.4 }
      }
   )

   useIntersectionObserver(
      feedbackLayerRef,
      ([entry]) => {
         if (entry === undefined) {
            return
         }
         feedbackLayerIsVisible = entry.isIntersecting
         const thresholdMarker = thresholdMarkerRef.peek()
         if (!thresholdMarker) {
            return
         }
         if (feedbackLayerIsVisible) {
            changeState('pulling')
         }
      },
      () => {
         return { root: pullZoneRef.peek(), threshold: 0.01 }
      }
   )

   // Another marker to indicate when pull-to-refresh can be used,
   // or if we should default to normal scroll.
   useIntersectionObserver(
      contentTopMarkerRef,
      ([entry]) => {
         if (entry === undefined) {
            return
         }
         // on startup, this will trigger canPull to be true,
         // and start the pull-to-refresh process.
         reachedTop.set(entry.isIntersecting)
      },
      () => {
         return { root: pullZoneRef.peek(), threshold: 0.9 }
      }
   )

   canPull.listen((canPull) => {
      const pullZone = getPullToRefreshElement()
      if (!pullZone) {
         return
      }
      if (canPull) {
         pullZone.addEventListener('pointerdown', handlePointerDown)
         // See explanation for this event in sidebar-provider.tsx
         pullZone.addEventListener('_pullstart', handleCustomPullStart)
      } else {
         pullZone.removeEventListener('pointerdown', handlePointerDown)
         pullZone.removeEventListener('_pullstart', handleCustomPullStart)
      }
   })

   height.listen(() => {
      // Prevents any funny behavior when the window resizes.
      contentRef.get()?.scrollIntoView({ behavior: 'instant', block: 'end' })
   })

   observer.onConnected(pullZoneRef, (pullZone) => {
      requestAnimationFrame(() => {
         // The initial state class makes the pull-zone "snap" to the content
         // area bu default. This is removed after the content is loaded.
         pullZone.classList.remove(styles.pullZoneInitialState as string)
         pullZone.scrollTo({ top: pullZone.scrollHeight, behavior: 'instant' })
      })
      return () => {
         height // Prevents GC until the pull-zone is unmounted.
         pullZone.classList.add(styles.pullZoneInitialState as string)
      }
   })

   return (
      <div
         {...rest}
         ref={pullZoneRef}
         class={[
            styles.pullZone,
            styles.pullZoneInitialState,
            { [styles.pullZoneCanPull as string]: canPull },
            rest.class
         ]}
      >
         <div ref={scrollContainerRef} class={styles.pullZoneScrollContainer}>
            <div ref={thresholdMarkerRef} />
            <div ref={feedbackLayerRef}>{feedback?.()}</div>
            <div
               ref={contentRef}
               class={[styles.pullZoneContent, contentClasses]}
            >
               {!contentTopMarkerProp ? (
                  <div
                     ref={contentTopMarkerRef}
                     class={styles.pullZoneContentTopMarker}
                  />
               ) : null}
               {children}
            </div>
         </div>
      </div>
   )
}

export class PullStartEvent extends Event {
   pointerTracker: PointerTracker
   constructor(pointerTracker: PointerTracker) {
      super('_pullstart', {
         bubbles: true,
         composed: true
      })
      this.pointerTracker = pointerTracker
   }
}

const KEYFRAMES = [
   {
      '--pull-zone-scroll-top': 0
   },
   {
      '--pull-zone-scroll-top': 100
   }
]
const MAX_PULL_ZONE_SCROLL_TOP = (3500 / 135) * 10

const ANIMATION_OPTIONS = { duration: 1000, easing: 'linear' }
