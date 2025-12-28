import {
   Cell,
   createScope,
   type SourceCell,
   useObserver,
   useScopeContext,
   useSetupEffect
} from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { Flags } from '@/constants/flags'

interface InternalKeyboardAwarenessCtx {
   dispatchVisibilityChange: (newHeight: number) => void
   currentVisualHeight: Cell<number>
   redirectingFocus: SourceCell<boolean>
}

export interface KeyboardAwarenessCtx {
   approximateHeight: Cell<number>
   isVisible: Cell<boolean>
}

const InternalKeyboardAwarenessScope =
   createScope<InternalKeyboardAwarenessCtx>('KeyboardAwareness')

const ExternalKeyboardAwarenessScope = createScope<KeyboardAwarenessCtx>(
   'ExternalKeyboardAwareness'
)
type DivProps = JSX.IntrinsicElements['div']
export interface VirtualKeyboardAwareViewProps extends DivProps {
   /**
    * Callback invoked when the virtual keyboard visibility changes.
    * Receives a {@link KeyboardVisibilityEvent} with visibility state and approximate height.
    */
   onKeyboardVisibilityChange?: JSX.ValueOrCell<(event: KeyboardVisibilityEvent) => void>
   /** Optional ref to the container element. */
   ref?: SourceCell<HTMLElement | null>
   /** Render function for the view's children. */
   children: () => JSX.Template
}

/**
 * A container component that tracks virtual keyboard visibility and provides
 * context for child components to respond to keyboard state changes.
 *
 * @example
 * ```tsx
 * <VirtualKeyboardAwareView
 *    onKeyboardVisibilityChange={(e) => console.log(e.isVisible, e.approximateHeight)}
 * >
 *    {() => (
 *       <VirtualKeyboardTriggers>
 *          <input type="text" />
 *       </VirtualKeyboardTriggers>
 *    )}
 * </VirtualKeyboardAwareView>
 * ```
 */
export function VirtualKeyboardAwareView(props: VirtualKeyboardAwareViewProps) {
   const { children: Content, ref: containerRef = Cell.source(null), onFocusOut, ...rest } = props

   const currentVisualHeight = Cell.source(0)
   const approximateHeight = Cell.source(0)
   const isVisible = Cell.source(false)
   const redirectingFocus = Cell.source(false)
   let oldHeight = 0

   const handleFocusOut = (e: FocusEvent) => {
      const container = containerRef.get()
      if (redirectingFocus.get()) {
         return
      }

      if (!e.relatedTarget) {
         dispatchVisibilityChange(innerHeight)
      }

      if (
         e.relatedTarget instanceof HTMLElement &&
         container?.contains(e.relatedTarget) &&
         e.relatedTarget.matches('[data-kbd-trigger] *')
      ) {
         // when focus is transferred to another virtual keyboard trigger,
         // Safari tries once again to force a scroll change, so it must
         // be misdirected here, again.
         redirectingFocus.set(true)
         e.relatedTarget.blur()
         e.relatedTarget.focus({ preventScroll: true })
         redirectingFocus.set(false)
      }

      if (typeof onFocusOut === 'function') {
         onFocusOut.bind(e.currentTarget as HTMLInputElement)(e)
      }
   }

   const updateHeight = () => {
      const container = containerRef.get()
      const isTriggeredByFocus =
         document.activeElement && container?.contains(document.activeElement)

      if (!isTriggeredByFocus) {
         return
      }

      const newHeight =
         'virtualKeyboard' in navigator
            ? innerHeight - navigator.virtualKeyboard.boundingRect.height
            : (window.visualViewport?.height ?? innerHeight)

      if (currentVisualHeight.get() === newHeight) {
         // prevent unecessary updates.
         return
      }

      dispatchVisibilityChange(newHeight)
   }

   const dispatchVisibilityChange = (nextHeight: number) => {
      const container = containerRef.peek()
      if (!container) {
         return
      }
      oldHeight = currentVisualHeight.get()
      currentVisualHeight.set(nextHeight)
      const activeElement = document.activeElement
      let approxHeight = Math.max(innerHeight, oldHeight) - nextHeight
      const visible = container.contains(activeElement) && approxHeight > 0
      if (!visible) {
         approxHeight = 0
      }
      isVisible.set(visible)
      approximateHeight.set(approxHeight)
      const event = new KeyboardVisibilityEvent(visible, approxHeight, activeElement)
      container.dispatchEvent(event)
   }

   // When all else fails, force reset scroll position
   const resetScroll = () => {
      window.scrollTo(0, 0)
   }

   useSetupEffect(() => {
      currentVisualHeight.set(window.visualViewport?.height ?? innerHeight)
      oldHeight = currentVisualHeight.get()
      updateHeight()

      if (!Flags.Runtime.Supports.VirtualKeyboardApi) {
         window.visualViewport?.addEventListener('resize', updateHeight)
         window.addEventListener('scroll', resetScroll, { passive: true })
         return () => {
            window.visualViewport?.removeEventListener('resize', updateHeight)
            window.removeEventListener('scroll', resetScroll)
         }
      }

      const previousOverlaysContent = navigator.virtualKeyboard.overlaysContent
      navigator.virtualKeyboard.overlaysContent = true
      const virtualKeyboard = navigator.virtualKeyboard
      virtualKeyboard.addEventListener('geometrychange', updateHeight)
      return () => {
         navigator.virtualKeyboard.overlaysContent = previousOverlaysContent
         virtualKeyboard.removeEventListener('geometrychange', updateHeight)
      }
   })

   const scopeCtx: InternalKeyboardAwarenessCtx = {
      dispatchVisibilityChange,
      currentVisualHeight,
      redirectingFocus
   }

   const externalScopeCtx: KeyboardAwarenessCtx = {
      approximateHeight,
      isVisible
   }

   return (
      <ExternalKeyboardAwarenessScope.Provider value={externalScopeCtx}>
         {() => (
            <InternalKeyboardAwarenessScope.Provider value={scopeCtx}>
               {() => (
                  <div {...rest} ref={containerRef} onFocusOut={handleFocusOut}>
                     <Content />
                  </div>
               )}
            </InternalKeyboardAwarenessScope.Provider>
         )}
      </ExternalKeyboardAwarenessScope.Provider>
   )
}

/**
 * Props for the {@link VirtualKeyboardTriggers} component.
 */
export interface VirtualKeyboardTriggerProps extends DivProps {
   /** Optional ref to the trigger container element. */
   ref?: SourceCell<HTMLDivElement | null>
}

/**
 * A wrapper component for input elements that should trigger virtual keyboard
 * visibility tracking.
 *
 * Must be used as a descendant of {@link VirtualKeyboardAwareView}. This component
 * handles focus management to prevent Safari's default scrolling behavior when
 * the virtual keyboard appears.
 *
 * @example
 * ```tsx
 * <VirtualKeyboardTriggers>
 *    <input type="text" placeholder="Type here..." />
 *    <textarea placeholder="Or here..." />
 * </VirtualKeyboardTriggers>
 * ```
 */
export function VirtualKeyboardTriggers(props: VirtualKeyboardTriggerProps) {
   const observer = useObserver()
   const { ref = Cell.source(null), ...rest } = props
   const { dispatchVisibilityChange, currentVisualHeight, redirectingFocus } = useScopeContext(
      InternalKeyboardAwarenessScope
   )

   const handleFocus = (event: Event) => {
      if (redirectingFocus.get()) {
         return
      }

      if ('virtualKeyboard' in navigator) {
         // We don't need any hackery here since Chrome and Edge are good
         // browsers and will handle this for us.
         return
      }

      const target = event.target as HTMLElement
      // The whole point is basically 'deceiving' the browser engine (read: Safari)
      // into thinking the element is not focused, so it doesn't force the
      // scrolling behavior.
      redirectingFocus.set(true)
      event.stopImmediatePropagation()
      target.blur()
      target.focus({ preventScroll: true })
      redirectingFocus.set(false)

      // This is an interesting bug in iOS. On the 6th/7th time the
      // keyboard is opened, the visual viewport change event isn't fired,
      // but the visual viewport changes anyway. Luckily, prior values
      // are recorded, so the event can be fired manually.
      const newVisualHeight = window.visualViewport?.height
      if (newVisualHeight !== undefined && newVisualHeight !== currentVisualHeight.get()) {
         dispatchVisibilityChange(newVisualHeight)
      }
   }

   observer.onConnected(ref, (trigger) => {
      const focusableChildren = trigger.querySelectorAll('textarea, input')
      for (const child of focusableChildren) {
         child.addEventListener('focus', handleFocus)
      }

      return () => {
         for (const child of focusableChildren) {
            child.removeEventListener('focus', handleFocus)
         }
      }
   })

   return <div {...rest} ref={ref} data-kbd-trigger />
}

export class KeyboardVisibilityEvent extends Event {
   static readonly type = 'keyboardvisibilitychange'
   constructor(
      public isVisible: boolean,
      public approximateHeight: number,
      public relatedTarget: EventTarget | null
   ) {
      super(KeyboardVisibilityEvent.type, {
         bubbles: false,
         cancelable: false,
         composed: false
      })
   }
}

/**
 * Hook to access the virtual keyboard awareness context.
 *
 * Must be used within a {@link VirtualKeyboardAwareView} component.
 * Returns reactive cells for tracking keyboard visibility and height.
 *
 * @returns The {@link KeyboardAwarenessCtx} containing `isVisible` and `approximateHeight` cells.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *    const { isVisible, approximateHeight } = useVirtualKeyboardAwareness()
 *    const paddingBottom = Cell.derived(() => `${approximateHeight.get()}px`)
 *
 *    return (
 *       <div style={{ paddingBottom }}>
 *          {If(isVisible, () => 'Keyboard is visible')}
 *       </div>
 *    )
 * }
 * ```
 */
export function useVirtualKeyboardAwareness() {
   return useScopeContext(ExternalKeyboardAwarenessScope)
}
