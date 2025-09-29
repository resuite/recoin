import { DynamicIcon } from '@/components/icons'
import { type PullState, PullToRefreshView } from '@/components/views/pull-to-refresh-view'
import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

interface PullToRefreshViewTestProps {
   children?: () => JSX.Template
}

const PullToRefreshViewTest = (props?: PullToRefreshViewTestProps) => {
   const state = Cell.source<PullState>('idle')
   const pulling = Cell.derived(() => {
      return state.get() === 'pulling' || state.get() === 'thresholdreached'
   })
   const idle = Cell.derived(() => {
      return state.get() === 'idle'
   })
   const actionTriggered = Cell.derived(() => {
      return state.get() === 'actiontriggered'
   })

   const FeedbackContent = () => {
      return (
         <div class='grid place-items-center place-content-center gap-0.5 h-full'>
            <DynamicIcon
               name='loader'
               class={[
                  'w-1.5 h-1.5 transition-[translate,scale,opacity]',
                  {
                     'opacity-0 duration-slower': idle,
                     'rotate-[calc(var(--pull-progress)*0.5deg)]': pulling,
                     'scale-[calc(var(--pull-progress)*0.01)]': pulling,
                     'opacity-[calc((var(--pull-progress)*0.005)-0.4)]': pulling,
                     'duration-0': pulling,
                     'animate-spin! duration-slower': actionTriggered
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
         feedback={FeedbackContent}
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
