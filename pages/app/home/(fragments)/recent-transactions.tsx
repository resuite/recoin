import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'
import { Cell } from 'retend'
import { useIntersectionObserver } from 'retend-utils/hooks'

const Header = () => {
   const headingVisibilityTracker = Cell.source<HTMLHeadingElement | null>(null)
   const intersectRatio = Cell.source(1)
   const isHidden = Cell.derived(() => {
      return intersectRatio.get() === 0
   })

   useIntersectionObserver(
      headingVisibilityTracker,
      ([entry]) => {
         intersectRatio.set(entry.intersectionRatio)
      },
      () => {
         return { threshold: [0, 0.25, 0.5, 0.75, 1] }
      }
   )

   return (
      <>
         <div class='h-0 flex items-end justify-center'>
            <div ref={headingVisibilityTracker} class='h-10 w-10 pointer-events-none' />
         </div>

         <h4 class={['py-0.5 text-center light-scheme w-full', {}]}>
            <span
               class={[
                  'inline-block text-lg origin-left transition-transform duration-slow',
                  { '-translate-x-[calc(50dvw-50%-var(--spacing))] scale-[1.25]': isHidden }
               ]}
            >
               Recent Transactions
            </span>
         </h4>
      </>
   )
}

export function RecentTransactions() {
   return (
      <>
         <div class='sticky z-10 -top-[1px] [--header:calc(var(--spacing)+2rem)]'>
            <Header />
         </div>
         <div class='pb-3 w-full -mt-0.5'>
            <TransactionListing />
         </div>
      </>
   )
}
