import { DynamicIcon } from '@/components/icons'
import { type PullState, PullToRefreshView } from '@/components/views/pull-to-refresh-view'
import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

interface PullToRefreshViewTestProps {
   children?: () => JSX.Template
}

interface PullToRefreshFeedbackProps {
   state: Cell<PullState>
}

const PullToRefreshFeedback = (props: PullToRefreshFeedbackProps) => {
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

const PullToRefreshViewTest = (props?: PullToRefreshViewTestProps) => {
   const state = Cell.source<PullState>('idle')

   const handleActionTriggered = async () => {
      const waitTime = 3500
      await new Promise((resolve) => {
         setTimeout(resolve, waitTime)
      })
   }

   const handleStateChange = (newState: PullState) => {
      state.set(newState)
   }

   return (
      <PullToRefreshView
         class='h-screen'
         feedback={() => <PullToRefreshFeedback state={state} />}
         onStateChange={handleStateChange}
         onActionTriggered={handleActionTriggered}
      >
         {props?.children ??
            (() => (
               <div class='text-big h-full light-scheme rounded-t-3xl'>
                  <div class='grid place-items-center h-full w-full'>{state}</div>
               </div>
            ))}
      </PullToRefreshView>
   )
}

export default PullToRefreshViewTest
