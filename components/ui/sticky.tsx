import { createPartitions } from '@/utilities/animations'
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
    * The CSS variable to which the scroll progress will be assigned.
    * @default '--stick-progress'
    */
   progressCssVariable?: string
   /**
    * A `Cell` reference to the container `div` element.
    */
   ref?: Cell<HTMLDivElement | null>
   /**
    * A callback function that is triggered when the sticky state changes.
    * @param event - The StickChangeEvent object.
    */
   onStickChange: (event: StickChangeEvent) => void
}

/**
 * A container that becomes "sticky" to the top of its parent scrolling area.
 *
 * This component monitors its position within the scrollable parent and dispatches
 * a `stickchange` event when its sticky state changes. It also exposes a CSS
 * custom property (`--stick-progress` by default) to its children, representing
 * the scroll progress within its designated "stickable" region. This is useful for
 * creating scroll-based animations.
 *
 * NOTE: The custom property is only available if the parent scroller implements a scroll
 * animation timeline and exposes its own `--scroll-unit` CSS custom property.
 *
 * @example
 * ```tsx
 * const handleStickChange = (event: StickChangeEvent) => {
 *   console.log('Sticky state changed:', event.wasStuck);
 * };
 *
 * <div class="scroller">
 *   <Sticky onStickChange={handleStickChange}>
 *     <div class="animated-header">
 *       Hello World
 *     </div>
 *   </Sticky>
 * </div>
 * ```
 *
 * // In your CSS:
 * ```css
 * .animated-header {
 *   opacity: var(--stick-progress);
 *   transform: translateY(calc((1 - var(--stick-progress)) * -50px));
 * }
 * ```
 *
 * @param props - The properties for the Sticky component.
 * @returns A JSX element that acts as a sticky container.
 */
export function Sticky(props: StickyProps) {
   const {
      children,
      ref: containerRef = Cell.source(null),
      progressCssVariable = '--stick-progress',
      ...rest
   } = props
   const offsetMirror = Cell.source<HTMLElement | null>(null)
   const normalizedCssExpression = Cell.source('0')

   const computeCssExpression = () => {
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
      const scrollerTopToOffsetTop = scrollerTopToContainerTop - clientHeight * 2

      // will count from start of container offset to top of container
      const [partition] = createPartitions('var(--scroll-unit)', {
         from: scrollerTopToOffsetTop / scrollDistance,
         to: scrollerTopToContainerTop / scrollDistance
      })
      normalizedCssExpression.set(partition)
   }

   useIntersectionObserver(
      offsetMirror,
      ([entry]) => {
         const container = containerRef.get()
         const scroller = container?.parentElement
         if (!scroller) {
            return
         }
         const event = new StickChangeEvent(!entry.isIntersecting, scroller)
         container.dispatchEvent(event)
      },
      () => {
         return { threshold: [0.99, 0] }
      }
   )

   useSetupEffect(() => {
      computeCssExpression()
      window.addEventListener('resize', computeCssExpression)
      return () => {
         window.removeEventListener('resize', computeCssExpression)
      }
   })

   return (
      <div
         ref={containerRef}
         style={{ [progressCssVariable]: normalizedCssExpression }}
         class={[styles.container, rest.class]}
         {...rest}
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
export class StickChangeEvent extends Event {
   /**
    * Creates an instance of StickChangeEvent.
    * @param wasStuck - The new sticky state. `true` if the component is stuck, `false` otherwise.
    * @param scroller - The scrolling element that contains the sticky component.
    */
   constructor(
      public wasStuck: boolean,
      public scroller: Element
   ) {
      super('stickchange')
   }
}
