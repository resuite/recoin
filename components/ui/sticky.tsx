import { useScrollTimelineContext } from '@/components/views/scroll-timeline-view'
import { Cell, useSetupEffect } from 'retend'
import { useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
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
    * A callback function that is triggered when the sticky state changes.
    * @param event - The StickChangeEvent object.
    */
   onStickStateChange: (event: StickStateChangeEvent) => void
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
 *     <div class="content">
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
   const { children, ref: containerRef = Cell.source(null), ...rest } = props
   const offsetMirror = Cell.source<HTMLElement | null>(null)
   const timeline = useScrollTimelineContext()

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

   useIntersectionObserver(
      offsetMirror,
      ([entry]) => {
         const container = containerRef.peek()
         const scroller = timeline.source.peek()
         if (!scroller || !container) {
            return
         }
         const event = new StickStateChangeEvent(!entry.isIntersecting, scroller)
         container.dispatchEvent(event)
      },
      () => {
         return { threshold: [0.99, 0] }
      }
   )

   useSetupEffect(() => {
      computeDistance()
      window.addEventListener('resize', computeDistance)
      return () => {
         window.removeEventListener('resize', computeDistance)
      }
   })

   return (
      <div ref={containerRef} class={[styles.container, rest.class]} {...rest}>
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
      super('stickstatechange')
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
