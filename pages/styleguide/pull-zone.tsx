import { DynamicIcon } from '@/components/icons';
import { PullToRefresh, type PullState } from '@/components/layout';
import { Cell, type SourceCell } from 'retend';
import type { JSX } from 'retend/jsx-runtime';

interface PullToRefreshTestProps {
   contentTopMarkerRef?: SourceCell<HTMLElement | null>;
   children?: unknown;
   allowPull?: JSX.ValueOrCell<boolean>;
}

const PullToRefreshTest = (props?: PullToRefreshTestProps) => {
   const state = Cell.source<PullState>('idle');
   const pulling = Cell.derived(() => {
      return state.get() === 'pulling' || state.get() === 'thresholdreached';
   });
   const actionTriggered = Cell.derived(() => {
      return state.get() === 'actiontriggered';
   });
   const topMarker = Cell.source<HTMLElement | null>(null);

   const FeedbackContent = () => {
      return (
         <div class='grid place-items-center place-content-center gap-0.5 h-full'>
            <DynamicIcon
               name='loader'
               class={[
                  'w-1.5 h-1.5 duration-slow transition-[translate,scale,opacity]',
                  {
                     'rotate-[calc(var(--pull-progress)*0.61deg)]': pulling,
                     'scale-[calc(var(--pull-progress)*0.01)]': pulling,
                     'opacity-[calc((var(--pull-progress)*0.005)-0.3)]':
                        pulling,
                     'duration-0': pulling,
                     'animate-spin!': actionTriggered,
                  },
               ]}
               style={{ animation: 'none' }}
            />
            <div
               class={[
                  'text-center opacity-0 duration-slower transition-opacity',
                  { 'opacity-75': actionTriggered },
               ]}
            >
               Refreshing your data...
            </div>
         </div>
      );
   };

   const handleActionTriggered = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
   };

   const handleStateChange = (newState: PullState) => {
      state.set(newState);
   };

   return (
      <PullToRefresh
         class='h-screen'
         feedback={FeedbackContent}
         onStateChange={handleStateChange}
         onActionTriggered={handleActionTriggered}
         contentTopMarker={props?.contentTopMarkerRef ?? topMarker}
         allowPull={props?.allowPull}
      >
         {props?.children ?? (
            <div class='text-big h-full light-scheme rounded-t-4xl'>
               <div ref={topMarker} class='h-0.25 w-full' />
               <div class='grid place-items-center h-full w-full'>{state}</div>
            </div>
         )}
      </PullToRefresh>
   );
};

export default PullToRefreshTest;
