import { Cell, useSetupEffect } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useIntersectionObserver } from 'retend-utils/hooks'
import { useScrollTimeline } from '@/components/scroll-view'
import { Flags } from '@/constants/flags'
import styles from './sticky.module.css'

type DivProps = JSX.IntrinsicElements['div']
/**
 * Props for the Sticky component.
 */
interface StickyProps extends DivProps {
   /**
    * A `Cell` reference to the container `div` element.
    */
   ref?: Cell<HTMLElement | null>
   /**
    * Affordance for an offset from the top of the scrolling area.
    */
   topOffset?: JSX.ValueOrCell<string>
   /**
    * Whether the sticking will be animated.
    */
   animated?: boolean
   /**
    * An optional string identifier to group multiple sticky elements.
    * Elements within the same layer can interact, for example, to determine
    * which one is currently 'topmost' when multiple are stuck.
    */
   layer?: string
   /**
    * A callback function that is triggered when the sticky state changes.
    * @param event - The StickChangeEvent object.
    */
   onStickStateChange?: (event: StickStateChangeEvent) => void
   /**
    * This is fired when the bounds for implementing a sticking animation
    * are set. They are defined as ranges within the parent scrolling area.
    * @param event The TimelineRangeEvent object
    * @returns
    */
   onStickTimelineRangeSet?: (event: StickTimelineRangeSetEvent) => void
}

/**
 * A container that becomes "sticky" to the top of its parent scrolling area.
 *
 * This component monitors its position within the scrollable parent and dispatches
 * a `stickchange` event when its sticky state changes.
 *
 * @example
 * ```tsx
 * const handleStickChange = (event: StickChangeEvent) => {
 *   console.log('Sticky state changed:', event.wasStuck);
 * };
 *
 * <div class="scroller">
 *   <Sticky onStickChange={handleStickChange}>
 *     <div class="content stuck:bg-red-400">
 *       Hello World
 *     </div>
 *   </Sticky>
 * </div>
 * ```
 *
 * @param props - The properties for the Sticky component.
 * @returns A JSX element that acts as a sticky container.
 */
export function Sticky(props: StickyProps) {
   const {
      children,
      ref: containerRef = Cell.source(null),
      animated,
      topOffset = '0px',
      layer,
      ...rest
   } = props
   const offsetMirror = Cell.source<HTMLElement | null>(null)
   const timeline = useScrollTimeline()

   const computeDistance = () => {
      const container = containerRef?.get()
      if (!container) {
         return
      }
      const scroller = container.parentElement
      if (!scroller) {
         return
      }

      const { clientHeight, offsetTop: scrollerTopToContainerTop } = container
      const scrollDistance = scroller.scrollHeight - scroller.clientHeight
      if (scrollDistance === 0) {
         return
      }
      const scrollerTopToOffsetTop = scrollerTopToContainerTop - clientHeight * 2

      const timelineRangeStart = scrollerTopToOffsetTop / scrollDistance
      const timelineRangeEnd = scrollerTopToContainerTop / scrollDistance

      container.dispatchEvent(new StickTimelineRangeSetEvent(timelineRangeStart, timelineRangeEnd))
   }

   const selectElementInLayer = (isStuck: boolean) => {
      const scrollable = timeline.source.peek() as Element
      const container = containerRef.peek() as Element
      const allStuckElementsInLayer = scrollable.querySelectorAll(
         `:scope > [data-layer="${layer}"][data-stuck]`
      )
      if (isStuck) {
         for (const element of allStuckElementsInLayer) {
            element.toggleAttribute('data-topmost', element === container)
         }
      } else {
         container.removeAttribute('data-topmost')
         const lastStickyElement = allStuckElementsInLayer.item(allStuckElementsInLayer.length - 1)
         lastStickyElement?.toggleAttribute('data-topmost', true)
      }
   }

   useIntersectionObserver(
      offsetMirror,
      ([entry]) => {
         const container = containerRef.peek()
         const scroller = timeline.source.peek()
         const rectOfOffsetMirror = entry.boundingClientRect

         if (
            rectOfOffsetMirror.y > innerHeight ||
            rectOfOffsetMirror.x > innerWidth ||
            !scroller ||
            !container
         ) {
            return
         }
         const isStuck = !entry.isIntersecting
         if (!Flags.Runtime.Supports.ScrollStateQueries) {
            if (isStuck) {
               container.setAttribute('data-stuck', 'true')
            } else {
               container.removeAttribute('data-stuck')
            }
         }
         if (layer) {
            selectElementInLayer(isStuck)
         }
         const event = new StickStateChangeEvent(isStuck, scroller)
         container.dispatchEvent(event)
      },
      () => {
         return { threshold: [0.99, 0] }
      }
   )

   useSetupEffect(() => {
      if (!animated) {
         return
      }
      computeDistance()
      window.addEventListener('resize', computeDistance)
      return () => {
         window.removeEventListener('resize', computeDistance)
      }
   })

   const style = { '--sticky-top': topOffset }

   if (typeof rest.style === 'object') {
      Object.assign(style, rest.style)
   }

   return (
      <div
         data-layer={layer}
         ref={containerRef}
         {...rest}
         class={[styles.container, rest.class]}
         style={style}
      >
         <div ref={offsetMirror} class={styles.offsetMirror} />
         <div>{children}</div>
      </div>
   )
}

/**
 * A custom event dispatched by the `Sticky` component when its sticky state changes.
 * This event is of type `stickchange`.
 */
export class StickStateChangeEvent extends Event {
   /**
    * Creates an instance of StickChangeEvent.
    * @param wasStuck - The new sticky state. `true` if the component is stuck, `false` otherwise.
    * @param scroller - The scrolling element that contains the sticky component.
    */
   constructor(
      public wasStuck: boolean,
      public scroller: Element
   ) {
      super('stickstatechange', { bubbles: false })
   }
}

export class StickTimelineRangeSetEvent extends Event {
   /**
    * Creates an instance of TimelineRangeEvent.
    * @param start - The start position of the timeline range.
    * @param end - The end position of the timeline range.
    */
   constructor(
      public start: number,
      public end: number
   ) {
      super('sticktimelinerangeset')
   }
}
