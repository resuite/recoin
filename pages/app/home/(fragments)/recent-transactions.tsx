import Search from '@/components/icons/svg/search'
import { Button } from '@/components/ui/button'
import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'
import { Cell } from 'retend'
import { useIntersectionObserver } from 'retend-utils/hooks'

const RecentTransactionsHeader = () => {
   const headingVisibilityTracker = Cell.source<HTMLHeadingElement | null>(null)
   const isStuckToTop = Cell.source(false)

   useIntersectionObserver(headingVisibilityTracker, ([entry]) => {
      isStuckToTop.set(!entry.isIntersecting)
   })

   return (
      <div class='sticky z-10 -top-[1px] grid grid-cols-1 grid-rows-1 [&>*]:[grid-area:1/1]'>
         <div
            ref={headingVisibilityTracker}
            class='w-full h-full -translate-y-[100%] pointer-events-none'
         />

         <h4
            class={[
               'text-center pt-0.5 w-full grid grid-cols-1 [&>*]:[grid-area:1/1]',
               { 'border-b-2 bg-canvas-background': isStuckToTop }
            ]}
         >
            <span
               class={[
                  '[--heading-translate:calc(50dvw-50%-var(--spacing))]',
                  'origin-left transition-transform duration-slow',
                  'inline-block py-0.5 w-fit justify-self-center text-lg',
                  { '-translate-x-(--heading-translate) scale-[1.245]': isStuckToTop }
               ]}
            >
               Recent Transactions
            </span>
            <Button
               class={[
                  'duration-slow transition-[opacity,translate]',
                  'button-bare opacity-0 translate-y-0.5 ease-out justify-self-end self-center',
                  { 'opacity-100 translate-y-0!': isStuckToTop }
               ]}
            >
               <Search class='h-1 w-1 [&_path]:stroke-2' />
            </Button>
         </h4>
      </div>
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
