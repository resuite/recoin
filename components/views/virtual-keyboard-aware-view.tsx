import { Cell, type SourceCell, useObserver } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './virtual-keyboard-aware-view.module.css'

declare global {
   interface Navigator {
      readonly virtualKeyboard: VirtualKeyboard
   }
}

interface VirtualKeyboard extends EventTarget {
   readonly boundingRect: DOMRectReadOnly
   overlaysContent: boolean
   show(): undefined
   hide(): undefined
   ongeometrychange: ((this: VirtualKeyboard, ev: Event) => void) | null
}

type DivProps = JSX.IntrinsicElements['div']
export interface VirtualKeyboardAwareViewProps extends DivProps {
   onVirtualKeyboardVisibilityChange?: (
      oldHeight: number,
      newHeight: number,
      activeElement: Element | null
   ) => void
   ref?: SourceCell<HTMLElement | null>
}

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
export const VirtualKeyboardAwareView = (
   props: VirtualKeyboardAwareViewProps
) => {
   const {
      children,
      ref: containerRef = Cell.source<HTMLElement | null>(null),
      onFocusIn,
      onFocusOut,
      onVirtualKeyboardVisibilityChange,
      ...rest
   } = props
   const observer = useObserver()
   let focusAdjustmentInProgress = false
   let currentVisualHeight = 0
   let oldHeight = 0

   // For browsers without `navigator.virtualKeyboard`, we use `onFocusIn` and `onFocusOut`
   // to detect when an input is focused near the bottom of the viewport (where the keyboard
   // might cover it). We temporarily add a CSS class (`styles.outOfViewport`) to adjust its
   // position and prevent unwanted scrolling or layout shifts, then remove it after. This
   // workaround helps provide a consistent experience in browsers like Safari and Firefox,
   // which lack reliable virtual keyboard APIs.
   const handlePointerDown = async (event: PointerEvent) => {
      const target = event.target as HTMLElement

      if ('virtualKeyboard' in navigator) {
         // We don't need any hackery here since Chrome and Edge are good
         // browsers and will handle this for us.
         if (typeof onFocusIn === 'function') {
            onFocusIn.bind(event.currentTarget as HTMLInputElement)(event)
         }
         return
      }

      if (focusAdjustmentInProgress) {
         if (typeof onFocusIn === 'function') {
            onFocusIn.bind(event.currentTarget as HTMLInputElement)(event)
         }
         return
      }

      if (isKeyboardInput(target)) {
         const target = event.target as HTMLElement
         event.stopImmediatePropagation()
         focusAdjustmentInProgress = true
         target.blur()
         target.classList.add(styles.outOfViewport)
         target.focus()
         requestAnimationFrame(() => {
            window.scrollTo(0, 0)
            target.classList.remove(styles.outOfViewport)
            focusAdjustmentInProgress = false
            // This is an interesting bug in iOS. On the 6th/7th time the
            // keyboard is opened, the visual viewport change event isn't fired,
            // but the visual viewport changes anyway. Luckily, prior values
            // are recorded, so the event can be fired manually.
            const newVisualHeight = window.visualViewport?.height
            if (
               newVisualHeight !== undefined &&
               newVisualHeight !== currentVisualHeight
            ) {
               dispatchVisibilityChange(newVisualHeight)
            }
         })
      }
   }

   const handleFocusOut = (e: FocusEvent) => {
      if (focusAdjustmentInProgress) {
         return
      }
      if (!e.relatedTarget) {
         dispatchVisibilityChange(innerHeight)
      }
      if (typeof onFocusOut === 'function') {
         onFocusOut.bind(e.currentTarget as HTMLInputElement)(e)
      }
   }

   const updateHeight = () => {
      const container = containerRef.get()
      const isTriggeredByFocus =
         container &&
         document.activeElement &&
         container.contains(document.activeElement)

      if (!isTriggeredByFocus) {
         return
      }

      const newHeight =
         'virtualKeyboard' in navigator
            ? innerHeight - navigator.virtualKeyboard.boundingRect.height
            : (window.visualViewport?.height ?? innerHeight)

      if (currentVisualHeight === newHeight) {
         // prevent unecessary updates.
         return
      }

      dispatchVisibilityChange(newHeight)
   }

   const handleScroll = () => {
      requestAnimationFrame(() => {
         window.scrollTo(0, 0)
      })
   }

   const dispatchVisibilityChange = (nextHeight: number) => {
      const container = containerRef.peek()
      if (!container) {
         return
      }
      oldHeight = currentVisualHeight
      currentVisualHeight = nextHeight
      onVirtualKeyboardVisibilityChange?.(
         oldHeight,
         currentVisualHeight,
         document.activeElement
      )
   }

   observer.onConnected(containerRef, () => {
      currentVisualHeight = window.visualViewport?.height ?? innerHeight
      oldHeight = currentVisualHeight
      updateHeight()

      if ('virtualKeyboard' in navigator) {
         const previousOverlaysContent =
            navigator.virtualKeyboard.overlaysContent
         navigator.virtualKeyboard.overlaysContent = true
         const virtualKeyboard = navigator.virtualKeyboard
         virtualKeyboard.addEventListener('geometrychange', updateHeight)
         return () => {
            navigator.virtualKeyboard.overlaysContent = previousOverlaysContent
            virtualKeyboard.removeEventListener('geometrychange', updateHeight)
         }
      }

      window.visualViewport?.addEventListener('resize', updateHeight)
      window.addEventListener('scroll', handleScroll)
      return () => {
         window.visualViewport?.removeEventListener('resize', updateHeight)
         window.removeEventListener('scroll', handleScroll)
      }
   })

   return (
      <div
         {...rest}
         ref={containerRef}
         onFocusOut={handleFocusOut}
         onPointerDown={handlePointerDown}
         class={[styles.keyboardAwareView, rest.class]}
      >
         {children}
      </div>
   )
}

const KEYBOARD_INPUTS = ['INPUT', 'TEXTAREA', 'SELECT']
const isKeyboardInput = (target: HTMLElement) => {
   return KEYBOARD_INPUTS.includes(target.tagName) || target.isContentEditable
}
