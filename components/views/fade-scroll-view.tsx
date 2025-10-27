import { scrollTimelineFallback, scrollTimelineFallbackBlock } from '@/utilities/scrolling'
import { Cell, useObserver } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './fade-scroll-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface FadeScrollViewProps extends DivProps {
   ref?: Cell<HTMLElement | null>
   useScrollTimeline?: 'block' | 'inline'
}

export function FadeScrollView(props: FadeScrollViewProps) {
   const {
      class: className,
      children,
      ref: contentRef = Cell.source(null),
      useScrollTimeline = 'block',
      ...rest
   } = props
   const containerRef = Cell.source<HTMLElement | null>(null)
   const observer = useObserver()

   if (useScrollTimeline === 'block') {
      observer.onConnected(contentRef, scrollTimelineFallbackBlock)
   } else if (useScrollTimeline === 'inline') {
      observer.onConnected(contentRef, scrollTimelineFallback)
   }

   return (
      <div ref={containerRef} class={styles.container}>
         <div
            {...rest}
            ref={contentRef}
            class={[
               styles.content,
               className,
               {
                  'animate-scrolling-block': useScrollTimeline === 'block',
                  'animate-scrolling': useScrollTimeline === 'inline'
               }
            ]}
         >
            {children}
         </div>
      </div>
   )
}
