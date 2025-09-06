import { animationsSettled } from '@/utilities/animations'
import { Cell, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './full-screen-transition-view.module.css'

type FullScreenTransition = 'slide-up' | 'slide-down' | 'fade-in' | 'fade-out'
type DivProps = JSX.IntrinsicElements['div']

/**
 * Props for the FullScreenTransitionView component.
 */
interface FullScreenTransitionViewProps extends DivProps {
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
 * />
 * ```
 */
export function FullScreenTransitionView(props: FullScreenTransitionViewProps) {
   const {
      when: changeWhenProp,
      from: current,
      to: next,
      transition: transitionProp = 'slide-up',
      ...rest
   } = props
   const changeWhen = useDerivedValue(changeWhenProp)
   const transition = useDerivedValue(transitionProp)
   const previousContentShown = Cell.source(!changeWhen.get())
   const nextContentShown = Cell.source(changeWhen.get())
   const nextViewRef = Cell.source<HTMLDivElement | null>(null)

   changeWhen.listen(
      async (hasTransitioned) => {
         if (hasTransitioned) {
            nextContentShown.set(true)
            await animationsSettled(nextViewRef)
            previousContentShown.set(false)
         } else {
            previousContentShown.set(true)
            await animationsSettled(nextViewRef)
            nextContentShown.set(false)
         }
      },
      { priority: -1 } // run after DOM updates.
   )

   return (
      <div
         data-transition={transition}
         data-changed={changeWhen}
         {...rest}
         class={[styles.fullScreenTransition, rest.class]}
      >
         <div class={styles.previousView}>{If(previousContentShown, current)}</div>
         <div ref={nextViewRef} class={styles.nextView}>
            {If(nextContentShown, next)}
         </div>
      </div>
   )
}
