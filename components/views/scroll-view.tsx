import { Cell, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { Flags } from '@/constants/flags'
import { Platform } from '@/utilities/browser'
import { useOverScrollEffect } from '@/utilities/composables/use-overscroll-effect'
import { ScrollTimelineScope, useTimelineSetup } from '@/utilities/composables/use-timeline-setup'
import classes from './scroll-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface ScrollViewProps extends DivProps {
   axis?: ScrollTimelineAxis
   children: () => JSX.Template
   ref?: Cell<HTMLElement | null>
   showScrollBar?: JSX.ValueOrCell<boolean>
}

/**
 * Creates a scrollable container that enables scroll-linked animations on its children.
 * It provides a context that allows descendant components to synchronize animations
 * with the scroll position of this container.
 *
 * @param props - The props for the component.
 * @returns The rendered `ScrollView` component.
 */
export function ScrollView(props: ScrollViewProps) {
   const {
      axis = 'block',
      children,
      ref: containerRef = Cell.source(null),
      showScrollBar = true,
      ...rest
   } = props
   const ctx = useTimelineSetup(containerRef, axis)
   useOverScrollEffect({
      containerRef,
      axis,
      isEnabled: Flags.OS.Name === Platform.Android
   })

   return (
      <ScrollTimelineScope.Provider value={ctx}>
         {() => (
            <div
               {...rest}
               ref={containerRef}
               data-scroll-axis={axis}
               data-show-scrollbar={showScrollBar}
               class={[rest.class, classes.container]}
            >
               {children?.()}
            </div>
         )}
      </ScrollTimelineScope.Provider>
   )
}

export function useScrollTimeline() {
   return useScopeContext(ScrollTimelineScope)
}
