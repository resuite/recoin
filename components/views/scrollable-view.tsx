import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './scrollable-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface ScrollableViewProps extends DivProps {
   ref?: Cell<HTMLElement | null>
   noFade?: JSX.ValueOrCell<boolean>
}

export function ScrollableView(props: ScrollableViewProps) {
   const {
      class: className,
      children,
      ref: contentRef = Cell.source(null),
      noFade = false,
      ...rest
   } = props

   return (
      <div class={styles.container} data-no-fade={noFade}>
         <div {...rest} ref={contentRef} class={[styles.content, className]}>
            {children}
         </div>
      </div>
   )
}
