import { animationsSettled } from '@/utilities/animations'
import { PointerTracker, type TrackedMoveEvent } from '@/utilities/pointer-gesture-tracker'
import { GESTURE_ANIMATION_MS } from '@/utilities/scrolling'
import {
   Cell,
   If,
   type SetupFn,
   type SourceCell,
   createScope,
   useObserver,
   useScopeContext,
   useSetupEffect
} from 'retend'
import { useDerivedValue, useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './stack-view-group.module.css'

// --- Constants ---

const ANIMATION_KEYFRAMES = [
   {
      '--stack-view-group-pull-progress': 1
   },
   {
      '--stack-view-group-pull-progress': 0
   }
]
const ANIMATION_OPTIONS = { duration: 1000, easing: 'linear' }
const FOCUSED = ':nth-last-child(1 of [data-open])'

// --- Types & Interfaces ---

type DivProps = JSX.IntrinsicElements['div']

export interface StackViewGroupProps extends DivProps {
   ref?: SourceCell<HTMLElement | null>
}

/**
 * Props for the StackView component.
 */
export interface StackViewProps extends DivProps {
   /**
    * Whether the view is currently open.
    */
   isOpen?: JSX.ValueOrCell<boolean>
   /**
    * Whether the view is the root of the navigation stack.
    * The root view is the first view and is always open.
    * It defaults to false.
    *
    * It doesn't do anything, but it's included for intuitiveness.
    */
   root?: boolean
   /**
    * A function that returns the content to be rendered within the view.
    * This can be a static function or a reactive cell.
    * Navigation is lazy, which means that the content is only rendered when the view is open,
    * and will be unmounted when the view is closed.
    */
   children: JSX.ValueOrCell<() => JSX.Template>
   /**
    * A ref to the underlying HTML element of the view.
    */
   ref?: SourceCell<HTMLElement | null>
   /**
    * Whether or not the view can be swiped from the left edge.
    * It defaults to true.
    */
   canSwipe?: JSX.ValueOrCell<boolean>
   /**
    * Fired when the user tries to close the view by swiping it away.
    */
   onCloseRequested?: () => void
}

interface StackViewContext {
   useFocusEffect: (effect: SetupFn) => void
}

// --- Custom Events ---

export class StackViewToggleEvent extends Event {
   static eventName = '__stackviewtoggle'

   constructor() {
      super(StackViewToggleEvent.eventName, { bubbles: false })
   }
}

export class StackViewFocusEvent extends Event {
   static eventName = '__stackviewfocus'

   constructor() {
      super(StackViewFocusEvent.eventName, { bubbles: false, composed: false })
   }
}

export class StackViewBlurEvent extends Event {
   static eventName = '__stackviewblur'

   constructor() {
      super(StackViewBlurEvent.eventName, { bubbles: false, composed: false })
   }
}

// --- Context & Scope ---

const StackViewScope = createScope<StackViewContext>()

// --- Components ---

/**
 * Provides a container for `StackView` components, establishing the layout for a stack-based navigation.
 * This component sets up a specific grid structure intended to manage and facilitate transitions between views.
 *
 * @param props - The properties for the navigation stack.
 * @returns A JSX element representing the navigation stack container.
 */
export function StackViewGroup(props: StackViewGroupProps) {
   const observer = useObserver()
   const { children, ref = Cell.source<HTMLElement | null>(null), ...rest } = props

   const handleToggleEvent = (event: Event) => {
      const target = event.currentTarget as HTMLElement
      for (const child of target.firstElementChild?.children ?? []) {
         const isFocusedView = child.matches(FOCUSED)
         const isBlurredView = child.matches(':nth-last-child(2 of [data-open])')

         if (isFocusedView) {
            child.dispatchEvent(new StackViewFocusEvent())
         } else if (isBlurredView) {
            child.dispatchEvent(new StackViewBlurEvent())
         }
      }
   }

   observer.onConnected(ref, (div) => {
      div.addEventListener(StackViewToggleEvent.eventName, handleToggleEvent)
      return () => {
         div.removeEventListener(StackViewToggleEvent.eventName, handleToggleEvent)
      }
   })

   return (
      <div {...rest} ref={ref} draggable='false' class={[styles.stackViewGroup, rest.class]}>
         <div class={styles.stackViewGroupContent}>{children}</div>
      </div>
   )
}

/**
 * Renders a view within a navigation stack, supporting swipe-to-close gestures
 * and deferred content loading/unloading for performance.
 *
 * The `StackView` component is designed to be a child of a navigation stack.
 * It manages its visibility based on the `isOpen` prop and can be swiped
 * to close if `canSwipe` is enabled. Content is only rendered when the view
 * is open or transitioning to open, and it's removed after the closing
 * animation completes.
 *
 * @param props - The properties for the StackView component.
 * @example
 * ```tsx
 * const nextPageIsOpen = Cell.source(false)
 *
 * const toggleNextPageOpenState = () => {
 *   nextPageIsOpen.set(!nextPageIsOpen.get())
 * }
 *
 * <StackViewGroup>
 *   <StackView root>
 *     {() => (
 *       <div>
 *         <Button onClick={toggleNextPageOpenState}>Open Page 2</Button >
 *       </div>
 *     )}
 *   </StackView>
 *   <StackView isOpen={nextPageIsOpen}>
 *     {() => (
 *       <div>
 *         <Button onClick={toggleNextPageOpenState}>Close Page 2</Button >
 *       </div>
 *     )}
 *   </StackView>
 * </StackViewGroup>
 * ```
 */
export function StackView(props: StackViewProps) {
   const {
      isOpen: isOpenProp,
      ref: containerRef = Cell.source<HTMLElement | null>(null),
      onCloseRequested,
      canSwipe: canSwipeProp = true,
      children: childrenProp,
      root,
      ...rest
   } = props

   const isOpen = useDerivedValue(isOpenProp)
   const children = useDerivedValue(childrenProp)
   const canSwipe = useDerivedValue(canSwipeProp)
   const observer = useObserver()
   const contentLoaded = Cell.source(root || isOpen.get())
   const focusEffects = new Set<SetupFn>()
   const blurCallbacks = new Map<SetupFn, () => void>()
   let stackGroupElement: HTMLElement | null = null

   let stackWidth: number | null = null
   let animation: Animation | null = null
   let viewOutOfViewport = false

   const startDragging = (event: PointerEvent) => {
      if (!stackGroupElement) {
         return
      }
      stackGroupElement.setAttribute('data-dragging', '')
      stackWidth = stackGroupElement.clientWidth
      navigator.vibrate?.([15, 15])

      animation = stackGroupElement.animate(ANIMATION_KEYFRAMES, ANIMATION_OPTIONS)
      animation.pause()

      const tracker = new PointerTracker()
      tracker.start(event)
      tracker.addEventListener('move', drag)
      tracker.addEventListener('end', stopDragging)
   }

   const drag = (event: TrackedMoveEvent) => {
      requestAnimationFrame(() => {
         const deltaX = event.deltaX
         if (deltaX > 0 && animation !== null && stackWidth !== null) {
            animation.currentTime = (deltaX / stackWidth) * GESTURE_ANIMATION_MS
         }
      })
   }

   const stopDragging = () => {
      stackWidth = null
      stackGroupElement?.removeAttribute('data-dragging')
      if (viewOutOfViewport) {
         onCloseRequested?.()
      }
      animation?.play()
      animation = null
   }

   const triggerFocusEffect = (effect: SetupFn) => {
      const cleanup = effect()
      if (cleanup) {
         blurCallbacks.set(effect, cleanup)
      }
   }

   const handleFocusEvent = () => {
      for (const effect of focusEffects) {
         triggerFocusEffect(effect)
      }
   }

   const handleBlurEvent = () => {
      for (const cleanup of blurCallbacks.values()) {
         cleanup()
      }
      blurCallbacks.clear()
   }

   const context: StackViewContext = {
      useFocusEffect: (effect) => {
         useSetupEffect(() => {
            const container = containerRef.get()
            if (container?.matches(FOCUSED)) {
               triggerFocusEffect(effect)
            }
            focusEffects.add(effect)

            return () => {
               focusEffects.delete(effect)
               blurCallbacks.delete(effect)
            }
         })
      }
   }

   useIntersectionObserver(
      containerRef,
      ([entry]) => {
         viewOutOfViewport = !entry.isIntersecting
      },
      () => ({ root: stackGroupElement, threshold: 0.6 })
   )

   observer.onConnected(containerRef, (element) => {
      stackGroupElement = getStackGroupElement(element)
      if (!stackGroupElement) {
         return
      }
      element.addEventListener(StackViewFocusEvent.eventName, handleFocusEvent)
      element.addEventListener(StackViewBlurEvent.eventName, handleBlurEvent)

      if (isOpen.get() && element.matches(FOCUSED)) {
         element.dispatchEvent(new StackViewFocusEvent())
      }
   })

   // Close and dispose hidden views.
   isOpen.listen(
      async (viewIsOpen) => {
         stackGroupElement?.dispatchEvent(new StackViewToggleEvent())

         if (viewIsOpen) {
            contentLoaded.set(true)
            return
         }

         const container = containerRef.get()
         if (!container) {
            return
         }

         await animationsSettled(container)
         if (!isOpen.get()) {
            contentLoaded.set(false)
         }
      },
      { priority: -1 } // set so it runs after editing the DOM.
   )

   return (
      <StackViewScope.Provider value={context}>
         {() => (
            <div
               {...rest}
               ref={containerRef}
               data-open={root || isOpen}
               class={[styles.stackViewGroupView, rest.class]}
            >
               {If(children, (content) => {
                  return If(contentLoaded, content)
               })}
               {If(canSwipe, () => {
                  return (
                     <div
                        class={styles.stackViewGroupViewPullHandle}
                        onPointerDown={startDragging}
                     />
                  )
               })}
            </div>
         )}
      </StackViewScope.Provider>
   )
}

// --- Hooks ---

/**
 * Runs an effect when the parent `StackView` becomes the focused (topmost) view.
 * The effect can return a cleanup function that runs when the view loses focus.
 *
 * @param effect - The function to run on focus. Can return a cleanup function to run on blur.
 * @example
 * ```tsx
 * function MyComponentInAStackView() {
 *   useStackViewFocusEffect(() => {
 *     console.log('View is focused');
 *
 *     return () => {
 *       console.log('View is blurred');
 *     };
 *   });
 *
 *   return <div>My Component</div>;
 * }
 * ```
 */
export const useStackViewFocusEffect = (effect: () => () => void) => {
   const { useFocusEffect } = useScopeContext(StackViewScope)
   useFocusEffect(effect)
}

// --- Helper Functions ---

function getStackGroupElement(element: HTMLElement | null): HTMLElement | null {
   const stack = element?.parentElement?.parentElement
   if (!stack || !stack.classList.contains(styles.stackViewGroup as string)) {
      return null
   }
   return stack
}
