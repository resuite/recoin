import Search from '@/components/icons/svg/search'
import { Button } from '@/components/ui/button'
import {
   type StickStateChangeEvent,
   type StickTimelineRangeSetEvent,
   Sticky
} from '@/components/ui/sticky'
import { useScrollTimelineContext } from '@/components/views/scroll-timeline-view'
import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'
import { Cell } from 'retend'

const RecentTransactionsHeader = () => {
   const stuck = Cell.source(false)
   const timeline = useScrollTimelineContext()
   const spanRef = Cell.source<HTMLSpanElement | null>(null)
   let spanAnimationController: AbortController | null = null

   const handleStickStateChange = (event: StickStateChangeEvent) => {
      stuck.set(event.wasStuck)
   }

   const handleStickTimelineRangeSet = (event: StickTimelineRangeSetEvent) => {
      if (spanAnimationController) {
         spanAnimationController.abort()
      }
      spanAnimationController = new AbortController()

      timeline.add({
         target: spanRef,
         keyframes: {
            scale: ['1', '1.25'],
            translate: ['0px', 'calc(-50dvw + 50% + var(--spacing))']
         },
         range: { start: event.start, end: event.end },
         signal: spanAnimationController.signal
      })
   }

   return (
      <Sticky
         onStickStateChange={handleStickStateChange}
         onStickTimelineRangeSet={handleStickTimelineRangeSet}
      >
         <h4
            class={[
               'text-center pt-0.5 w-full grid grid-cols-1 *:[grid-area:1/1]',
               'before:content before:[grid-area:1/1] before:self-end before:h-[2px] before:bg-canvas-text',
               'before:scale-x-0 before:transition-transform before:duration-default before:origin-left',
               {
                  'bg-canvas-background [box-shadow:-1px_9px_21px_0_#00000012]': stuck,
                  'before:scale-x-100!': stuck
               }
            ]}
         >
            <span
               ref={spanRef}
               class='origin-left will-change-[translate,scale] inline-block py-0.5 w-fit justify-self-center text-lg'
            >
               Recent Transactions
            </span>
            <Button
               class={[
                  'duration-bit-slower transition-[opacity,translate]',
                  'button-bare opacity-0 translate-y-0.5 ease-out justify-self-end self-center',
                  { 'opacity-100 translate-y-0!': stuck }
               ]}
            >
               <Search class='h-1 w-1 [&_path]:stroke-2' />
            </Button>
         </h4>
      </Sticky>
   )
}

export function RecentTransactions() {
   return (
      <>
         <RecentTransactionsHeader />
         <div class='pb-3 w-full -mt-0.75'>
            <TransactionListing />
         </div>
      </>
   )
}
