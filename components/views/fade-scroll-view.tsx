import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './fade-scroll-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface FadeScrollViewProps extends DivProps {
   ref?: Cell<HTMLElement | null>
   noFade?: JSX.ValueOrCell<boolean>
}

export function FadeScrollView(props: FadeScrollViewProps) {
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
