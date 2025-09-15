import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './fade-scroll-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface FadeScrollViewProps extends DivProps {
   ref?: Cell<HTMLElement | null>
}

export function FadeScrollView(props: FadeScrollViewProps) {
   const { class: className, children, ref: contentRef = Cell.source(null), ...rest } = props
   const containerRef = Cell.source<HTMLElement | null>(null)

   return (
      <div ref={containerRef} class={styles.container}>
         <div {...rest} ref={contentRef} class={[styles.content, className]}>
            {children}
         </div>
      </div>
   )
}
