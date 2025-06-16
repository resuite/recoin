import { Cell, type SourceCell, useObserver } from 'retend';
import type { JSX } from 'retend/jsx-runtime';
import styles from './virtual-keyboard-aware-view.module.css';

type DivProps = JSX.IntrinsicElements['div'];
export interface VirtualKeyboardAwareViewProps extends DivProps {
   onVirtualKeyboardVisibilityChange?: (
      oldHeight: number,
      newHeight: number,
      activeElement: Element | null,
   ) => void;
   ref?: SourceCell<HTMLElement | null>;
}

const KEYBOARD_INPUTS = ['INPUT', 'TEXTAREA', 'SELECT'];
const isKeyboardInput = (target: HTMLElement) => {
   return KEYBOARD_INPUTS.includes(target.tagName) || target.isContentEditable;
};

/**
 * A view component that notifies parent components about changes in the virtual keyboard's visibility.
 *
 * It primarily serves to trigger the `onVirtualKeyboardVisibilityChange` callback when
 * the `visualViewport.height` changes (usually due to the keyboard appearing or
 * disappearing) while an input element within this component is focused.
 *
 * This allows consuming components to react to keyboard visibility changes and make
 * necessary layout adjustments, such as ensuring a focused input remains visible.
 *
 * @param {VirtualKeyboardAwareViewProps} props - The props for the component.
 * @param {Function} [props.onVirtualKeyboardVisibilityChange] - Callback function triggered when the virtual keyboard's visibility changes.
 *   It receives the old viewport height, new viewport height, and the currently active element.
 * @param {SourceCell<HTMLElement | null>} [props.ref] - A `SourceCell` to get a reference to the component's root `div` element.
 * @example
 * ```tsx
 * import { VirtualKeyboardAwareView } from './virtual-keyboard-aware-view';
 *
 * const MyForm = () => {
 *   const handleKeyboardVisibilityChange = (
 *     oldHeight: number,
 *     newHeight: number,
 *     activeElement: Element | null,
 *   ) => {
 *     console.log('Keyboard visibility changed:', { oldHeight, newHeight, activeElement });
 *   };
 *
 *   return (
 *     <VirtualKeyboardAwareView onVirtualKeyboardVisibilityChange={handleKeyboardVisibilityChange}>
 *       <form>
 *         <input type="text" placeholder="Focus me" />
 *         <textarea placeholder="Or me"></textarea>
 *       </form>
 *     </VirtualKeyboardAwareView>
 *   );
 * };
 * ```
 * @returns {JSX.Template} The rendered VirtualKeyboardAwareView component.
 */
// TODO: Throw all this out when support for navigator.virtualKeyboard is more widespread.
export const VirtualKeyboardAwareView = (
   props: VirtualKeyboardAwareViewProps,
) => {
   const {
      children,
      ref: containerRef = Cell.source<HTMLElement | null>(null),
      onFocusIn,
      onFocusOut,
      onVirtualKeyboardVisibilityChange,
      ...rest
   } = props;
   const observer = useObserver();
   let focusAdjustmentInProgress = false;
   let currentVisualHeight = 0;
   let oldHeight = 0;

   const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (focusAdjustmentInProgress) {
         if (typeof onFocusIn === 'function') {
            onFocusIn.bind(event.currentTarget as HTMLInputElement)(event);
         }
         return;
      }
      if (isKeyboardInput(target)) {
         const target = event.target as HTMLElement;
         const { offsetTop, offsetHeight } = target;
         const distanceFromBottom = innerHeight - offsetTop + offsetHeight;

         if (distanceFromBottom >= innerHeight / 2) {
            // Focus target is in the top half of the screen, so we may
            // not need to adjust.
            return;
         }

         event.stopImmediatePropagation();
         focusAdjustmentInProgress = true;

         target.blur();
         target.classList.add(styles.outOfViewport);

         target.focus();
         focusAdjustmentInProgress = false;

         target.classList.remove(styles.outOfViewport);
      }
   };

   const handleFocusOut = (e: FocusEvent) => {
      if (focusAdjustmentInProgress) {
         return;
      }
      if (!e.relatedTarget) {
         dispatchVisibilityChange(innerHeight);
      }
      if (typeof onFocusOut === 'function') {
         onFocusOut.bind(e.currentTarget as HTMLInputElement)(e);
      }
   };

   const updateVisualHeight = () => {
      const container = containerRef.get();
      const isTriggeredByFocus =
         container &&
         document.activeElement &&
         container.contains(document.activeElement);

      if (!isTriggeredByFocus) {
         return;
      }
      dispatchVisibilityChange(window.visualViewport?.height ?? innerHeight);
   };

   const dispatchVisibilityChange = (nextHeight: number) => {
      const container = containerRef.peek();
      if (!container) {
         return;
      }
      oldHeight = currentVisualHeight;
      currentVisualHeight = nextHeight;
      onVirtualKeyboardVisibilityChange?.(
         oldHeight,
         currentVisualHeight,
         document.activeElement,
      );
   };

   const handleScroll = () => {
      window.scrollTo(0, 0);
   };

   observer.onConnected(containerRef, () => {
      currentVisualHeight = window.visualViewport?.height ?? innerHeight;
      oldHeight = currentVisualHeight;

      updateVisualHeight();
      visualViewport?.addEventListener('resize', updateVisualHeight);
      window.addEventListener('scroll', handleScroll);

      return () => {
         visualViewport?.removeEventListener('resize', updateVisualHeight);
         window.removeEventListener('scroll', handleScroll);
      };
   });

   return (
      <div
         {...rest}
         ref={containerRef}
         onFocusIn={handleFocusIn}
         onFocusOut={handleFocusOut}
         class={[styles.keyboardAwareView, rest.class]}
      >
         {children}
      </div>
   );
};
