import { DynamicIcon } from '@/components/icons'
import type { PullState } from '@/components/views/pull-to-refresh-view'
import { Cell } from 'retend'

interface PullToRefreshFeedbackProps {
   state: Cell<PullState>
}

export const PullToRefreshFeedback = (props: PullToRefreshFeedbackProps) => {
   const { state } = props
   const idle = Cell.derived(() => {
      return state.get() === 'idle'
   })
   const pulling = Cell.derived(() => {
      return state.get() === 'pulling' || state.get() === 'thresholdreached'
   })
   const actionTriggered = Cell.derived(() => {
      return state.get() === 'actiontriggered'
   })
   const visible = Cell.derived(() => {
      return pulling.get() || actionTriggered.get()
   })

   return (
      <div class='grid place-items-center place-content-center gap-0.5 h-full'>
         <DynamicIcon
            name='loader'
            class={[
               'w-1.5 h-1.5 transition-[translate,rotate,scale,opacity]',
               {
                  'opacity-0 duration-slower': idle,
                  'rotate-[calc(var(--pull-progress)*0.5deg)]': visible,
                  'scale-[min(calc(var(--pull-progress)*0.01),1.95)]': pulling,
                  'opacity-[calc((var(--pull-progress)*0.005)-0.4)]': pulling,
                  'duration-0': pulling,
                  'animate-spin! [transition-timing-function:linear]': actionTriggered
               }
            ]}
            style={{ animation: 'none' }}
         />
         <div
            class={[
               'text-center opacity-0 duration-slower transition-opacity',
               { 'opacity-75': actionTriggered }
            ]}
         >
            Refreshing your data...
         </div>
      </div>
   )
}
