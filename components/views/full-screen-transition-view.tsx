import { animationsSettled } from '@/utilities/animations'
import { Cell, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './full-screen-transition-view.module.css'

type FullScreenTransition = 'slide-up' | 'slide-down' | 'fade-in' | 'fade-out'
type DivProps = JSX.IntrinsicElements['div']

interface FullScreenTransitionViewProps extends DivProps {
   when: JSX.ValueOrCell<boolean>
   from: () => JSX.Template
   to: () => JSX.Template
   transition?: JSX.ValueOrCell<FullScreenTransition>
}

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
   const nextViewRef = Cell.source<HTMLDivElement | null>(null)

   changeWhen.listen(
      async (hasTransitioned) => {
         if (!hasTransitioned) {
            return
         }
         await animationsSettled(nextViewRef)
         previousContentShown.set(false)
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
         {If(previousContentShown, () => (
            <div class={styles.previousView}>{current()}</div>
         ))}
         <div ref={nextViewRef} class={styles.nextView}>
            {If(changeWhen, next)}
         </div>
      </div>
   )
}
