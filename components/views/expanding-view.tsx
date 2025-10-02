import { useSidebarContext } from '@/components/views/sidebar-provider-view'
import { animationsSettled } from '@/utilities/animations'
import { tryFn } from '@/utilities/miscellaneous'
import { Cell, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './expanding-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

/**
 * Props for the ExpandingView component.
 */
interface ExpandingViewProps extends DivProps {
   /**
    * A boolean value or cell indicating whether the view is open or closed.
    * Controls the expansion and collapse animation.
    */
   isOpen: JSX.ValueOrCell<boolean>
   /**
    * A function that returns the JSX template for the content to be displayed
    * when the view is open.
    */
   children: () => JSX.Template
   /**
    * Initial size of the expanding view when opened.
    * This value sets the CSS variable controlling the expanded dimension
    * and should be compatible with CSS size values (e.g., "200px", "50%").
    */
   expandSize?: JSX.ValueOrCell<string>
   /**
    * The origin point for the expansion animation. This value sets the CSS
    * variable `--expand-origin` and should be compatible with the CSS `inset`
    * property (e.g., " 20px 50px").
    */
   expandOrigin?: JSX.ValueOrCell<string>
   /**
    * A Cell to hold the color of the expanding view.
    * This value sets the CSS variable controlling the expanded color.
    * It should be compatible with CSS color values (e.g., "red", "#ff0000").
    */
   expandColor?: JSX.ValueOrCell<string>
   /**
    * A Cell to hold a reference to the root HTML element of the component.
    */
   ref?: Cell<HTMLElement | null>
}

/**
 * A component that reveals or hides content with an expanding/collapsing animation.
 * The animation is controlled by the `isOpen` prop and uses CSS transitions
 * on an internal element's scale and opacity. The origin of the animation
 * can be customized via the `expandOrigin` prop.
 *
 * @param props - The props for the ExpandingView component.
 * @returns A JSX element representing the ExpandingView.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOpen = Cell.source(false)
 *
 *   return (
 *     <div>
 *       <Button onClick={() => isOpen.set(!isOpen.get())}>Toggle View</Button >
 *       <ExpandingView isOpen={isOpen} >
 *          {() => <p>This is the expanded content.</p>}
 *       </ExpandingView>
 *     </div>
 *   )
 * }
 * ```
 */
export function ExpandingView(props: ExpandingViewProps) {
   const { isOpen: isOpenProp, expandOrigin, expandSize, expandColor, children, ...rest } = props
   const isOpen = useDerivedValue(isOpenProp)
   const contentLoaded = Cell.source(isOpen.get())
   const clipPathRef = Cell.source<HTMLElement | null>(null)
   const sidebarContext = tryFn(() => useSidebarContext())
   const style = {
      '--expand-origin': expandOrigin,
      '--expand-size': expandSize,
      '--expand-color': expandColor
   }

   isOpen.listen(
      async (viewIsOpen) => {
         if (sidebarContext && viewIsOpen) {
            sidebarContext.toggleSidebarEnabled(false)
         }

         await animationsSettled(clipPathRef)
         contentLoaded.set(isOpen.get() && viewIsOpen)

         if (sidebarContext && !viewIsOpen) {
            sidebarContext.toggleSidebarEnabled(true)
         }
      },
      { priority: -1 }
   )

   return (
      <div class={styles.container} style={style} data-open={isOpen}>
         <div ref={clipPathRef} class={styles.clipPath} />
         <div {...rest} class={[styles.content, rest.class]}>
            {If(contentLoaded, children)}
         </div>
      </div>
   )
}
