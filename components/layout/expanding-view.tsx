import type { JSX } from 'retend/jsx-runtime';
import { useDerivedValue } from 'retend-utils/hooks';
import { Cell, If } from 'retend';
import { defer } from '@/utilities/miscellaneous';
import styles from './expanding-view.module.css';

type DivProps = JSX.IntrinsicElements['div'];

/**
 * Props for the ExpandingView component.
 */
interface ExpandingViewProps extends DivProps {
   /**
    * A boolean value or cell indicating whether the view is open or closed.
    * Controls the expansion and collapse animation.
    */
   isOpen: JSX.ValueOrCell<boolean>;
   /**
    * A function that returns the JSX template for the content to be displayed
    * when the view is open.
    */
   content: () => JSX.Template;
   /**
    * Initial size of the expanding view when opened.
    * This value sets the CSS variable controlling the expanded dimension
    * and should be compatible with CSS size values (e.g., "200px", "50%").
    */
   expandSize?: JSX.ValueOrCell<string>;
   /**
    * The origin point for the expansion animation. This value sets the CSS
    * variable `--expand-origin` and should be compatible with the CSS `inset`
    * property (e.g., " 20px 50px;").
    */
   expandOrigin?: JSX.ValueOrCell<string>;
   /**
    * A Cell to hold the color of the expanding view.
    * This value sets the CSS variable controlling the expanded color.
    * It should be compatible with CSS color values (e.g., "red", "#ff0000").
    */
   expandColor?: JSX.ValueOrCell<string>;
   /**
    * A Cell to hold a reference to the root HTML element of the component.
    */
   ref?: Cell<HTMLElement | null>;
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
 *   const isOpen = Cell.source(false);
 *
 *   return (
 *     <div>
 *       <button onClick={() => isOpen.set(!isOpen.get())}>Toggle View</button>
 *       <ExpandingView isOpen={isOpen} content={() => <p>This is the expanded content.</p>} />
 *     </div>
 *   );
 * }
 * ```
 */
export function ExpandingView(props: ExpandingViewProps) {
   const {
      children,
      isOpen: isOpenProp,
      expandOrigin,
      expandSize,
      expandColor,
      content,
      ...rest
   } = props;
   const isOpen = useDerivedValue(isOpenProp);
   const contentLoaded = Cell.source(isOpen.get());
   const clipPathRef = Cell.source<HTMLElement | null>(null);

   isOpen.listen((viewIsOpen) => {
      if (viewIsOpen) {
         contentLoaded.set(true);
         return;
      }
      // Deferred till next event loop cycle so that the
      // needed animations can be collected.
      defer(async () => {
         const clipPath = clipPathRef.get();
         if (!clipPath) {
            return;
         }
         const closingViewTransitions = clipPath.getAnimations();
         await Promise.allSettled(
            closingViewTransitions.map((c) => c.finished),
         );
         // We need to check again, in case the transition and closing
         // was cancelled.
         if (!isOpen.get()) {
            contentLoaded.set(false);
         }
      });
   });

   const style = {
      '--expand-origin': expandOrigin,
      '--expand-size': expandSize,
      '--expand-color': expandColor,
   };

   return (
      <div class={styles.container} style={style}>
         <div {...rest} class={[styles.content, rest.class]} data-open={isOpen}>
            {If(contentLoaded, content)}
         </div>
         <div ref={clipPathRef} class={styles.clipPath} />
      </div>
   );
}
