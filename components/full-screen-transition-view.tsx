import { Cell, createScope, If, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import { animationsSettled } from '@/utilities/animations'
import styles from './full-screen-transition-view.module.css'

export type FullScreenTransition = 'slide-up' | 'slide-down' | 'fade-in' | 'fade-out' | 'blink'
export type TransitionSpeed = 'default' | 'fast' | 'device' | 'slow'
type DivProps = JSX.IntrinsicElements['div']

interface FullScreenTransitionCtx {
   activeViewRef: Cell<HTMLElement | null>
}

const FullScreenTransitionScope = createScope<FullScreenTransitionCtx>()

/**
 * Props for the FullScreenTransitionView component.
 */
interface FullScreenTransitionViewProps extends DivProps {
   /**
    * Reference to the underlying container element.
    */
   ref?: Cell<HTMLElement | null>
   /**
    * A boolean condition. When this value changes from false to true,
    * the component transitions from the 'from' view to the 'to' view.
    */
   when: JSX.ValueOrCell<boolean>
   /**
    * A function that returns the template for the initial view (the "from" state).
    */
   from: () => JSX.Template
   /**
    * A function that returns the template for the destination view (the "to" state).
    */
   to: () => JSX.Template
   /**
    * The type of animation to use for the transition.
    * @default 'slide-up'
    */
   transition?: JSX.ValueOrCell<FullScreenTransition>
   /**
    * How long the transition should take.
    * @default '--speed-device'
    */
   speed?: JSX.ValueOrCell<TransitionSpeed>
   /**
    * Fires after a transition ends.
    */
   onFullScreenTransition?: (event: FullScreenTransitionEvent) => void
}

/**
 * A component that manages a full-screen animated transition between two views.
 *
 * The transition is triggered when the `when` prop changes. It animates from the
 * content provided in `from` to the content provided in `to`.
 *
 * @param props - The props for the component.
 * @returns A JSX element that wraps the two transitioning views.
 *
 * @example
 * ```tsx
 * const showSettings = Cell.source(false)
 *
 * <FullScreenTransitionView
 *   when={showSettings}
 *   from={() => <HomePage />}
 *   to={() => <SettingsPage />}
 *   transition="slide-up"
 *   speed="device"
 * />
 * ```
 */
export function FullScreenTransitionView(props: FullScreenTransitionViewProps) {
   const {
      ref: containerRef = Cell.source(null),
      when: changeWhenProp,
      from: current,
      to: next,
      transition: transitionProp = 'slide-up',
      speed: speedProp = 'device',
      ...rest
   } = props
   const changeWhen = useDerivedValue(changeWhenProp)
   const transition = useDerivedValue(transitionProp)
   const speed = useDerivedValue(speedProp)
   const previousContentShown = Cell.source(!changeWhen.get())
   const nextContentShown = Cell.source(changeWhen.get())
   const nextViewRef = Cell.source<HTMLDivElement | null>(null)
   const previousViewRef = Cell.source<HTMLDivElement | null>(null)
   const wasModified = Cell.source(false)

   const transitionSpeed = Cell.derived(() => {
      return `var(--speed-${speed.get()})`
   })

   changeWhen.listen(
      async (hasTransitioned) => {
         wasModified.set(true)
         if (hasTransitioned) {
            nextContentShown.set(true)
            await animationsSettled(nextViewRef)
            previousContentShown.set(false)
         } else {
            previousContentShown.set(true)
            await animationsSettled(nextViewRef)
            nextContentShown.set(false)
         }
         const container = containerRef.peek()
         const direction = hasTransitioned ? 'forwards' : 'back'
         container?.dispatchEvent(new FullScreenTransitionEvent(direction))
      },
      { priority: -1 } // run after DOM updates.
   )

   const activeViewRef = Cell.derived(() => {
      return changeWhen.get() ? nextViewRef.peek() : previousViewRef.peek()
   })

   const ctx = {
      activeViewRef
   }

   return (
      <FullScreenTransitionScope.Provider value={ctx}>
         {() => (
            <div
               {...rest}
               ref={containerRef}
               style={{ '--full-screen-transition-speed': transitionSpeed }}
               data-transition={transition}
               data-changed={changeWhen}
               data-modified={wasModified}
               class={[styles.fullScreenTransition, rest.class]}
            >
               <div ref={previousViewRef} class={styles.previousView}>
                  {If(previousContentShown, current)}
               </div>
               <div ref={nextViewRef} class={styles.nextView}>
                  {If(nextContentShown, next)}
               </div>
            </div>
         )}
      </FullScreenTransitionScope.Provider>
   )
}

/**
 * Provides access to the nearest `FullScreenTransition` context.
 * Use this hook within components nested inside `FullScreenTransitionView` to access transition-related state.
 */
export function useFullScreenTransitionContext() {
   return useScopeContext(FullScreenTransitionScope)
}

type TransitionDirection = 'back' | 'forwards'

export class FullScreenTransitionEvent extends Event {
   constructor(public direction: TransitionDirection) {
      super('fullscreentransition', {
         cancelable: false,
         composed: false,
         bubbles: false
      })
   }
}
