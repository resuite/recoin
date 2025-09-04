import {
   Cell,
   type SourceCell,
   createScope,
   useObserver,
   useScopeContext,
   useSetupEffect
} from 'retend'
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

interface KeyboardAwarenessCtx {
   dispatchVisibilityChange: (newHeight: number) => void
   currentVisualHeight: Cell<number>
   redirectingFocus: SourceCell<boolean>
}

const KeyboardAwarenessScope = createScope<KeyboardAwarenessCtx>('KeyboardAwareness')

type DivProps = JSX.IntrinsicElements['div']
export interface VirtualKeyboardAwareViewProps extends DivProps {
   onKeyboardVisibilityChange?: JSX.ValueOrCell<(event: KeyboardVisibilityEvent) => void>
   ref?: SourceCell<HTMLElement | null>
   children: () => JSX.Template
}

export function VirtualKeyboardAwareView(props: VirtualKeyboardAwareViewProps) {
   const { children, ref: containerRef = Cell.source(null), onFocusOut, ...rest } = props

   const currentVisualHeight = Cell.source(0)
   const redirectingFocus = Cell.source(false)
   let oldHeight = 0

   const handleFocusOut = (e: FocusEvent) => {
      if (redirectingFocus.get()) {
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
      let approximateHeight = Math.max(innerHeight, oldHeight) - nextHeight
      const visible = container.contains(activeElement) && approximateHeight > 0
      if (!visible) {
         approximateHeight = 0
      }
      const event = new KeyboardVisibilityEvent(visible, approximateHeight, activeElement)
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

      if (!('virtualKeyboard' in navigator)) {
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

   const scopeCtx: KeyboardAwarenessCtx = {
      dispatchVisibilityChange,
      currentVisualHeight,
      redirectingFocus
   }

   return (
      <KeyboardAwarenessScope.Provider value={scopeCtx}>
         {() => (
            <div
               {...rest}
               ref={containerRef}
               onFocusOut={handleFocusOut}
               class={[styles.keyboardAwareView, rest.class]}
            >
               {children?.()}
            </div>
         )}
      </KeyboardAwarenessScope.Provider>
   )
}

export interface VirtualKeyboardTriggerProps extends DivProps {
   ref?: SourceCell<HTMLDivElement | null>
}

export function VirtualKeyboardTrigger(props: VirtualKeyboardTriggerProps) {
   const observer = useObserver()
   const { ref = Cell.source(null), ...rest } = props
   const { dispatchVisibilityChange, currentVisualHeight, redirectingFocus } =
      useScopeContext(KeyboardAwarenessScope)

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
      const child = trigger.children[0]
      if (!(child instanceof HTMLElement)) {
         throw new Error('<VirtualKeyboardTrigger/> child must be an HTMLElement.')
      }
      child.addEventListener('focus', handleFocus)

      return () => {
         child.removeEventListener('focus', handleFocus)
      }
   })

   return <div {...rest} ref={ref} />
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
