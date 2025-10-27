import Search from '@/components/icons/svg/search'
import { Button } from '@/components/ui/button'
import { type StickChangeEvent, Sticky } from '@/components/ui/sticky'
import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'
import { interpolate } from '@/utilities/animations'
import { Cell } from 'retend'

export function RecentTransactions() {
   const isStuckToTop = Cell.source(false)
   const cssVar = 'var(--stick-progress)'
   const translate = interpolate(cssVar, '0px', 'calc(-50dvw + 50% + var(--spacing))')
   const scale = interpolate(cssVar, '1', '1.245')

   const handleStickChange = (event: StickChangeEvent) => {
      isStuckToTop.set(event.wasStuck)
   }

   return (
      <>
         <Sticky onStickChange={handleStickChange}>
            <h4
               class={[
                  'text-center pt-0.5 w-full grid grid-cols-1 *:[grid-area:1/1]',
                  { 'border-b-2 bg-canvas-background': isStuckToTop }
               ]}
            >
               <span
                  style={{ translate, scale }}
                  class='origin-left inline-block py-0.5 w-fit justify-self-center text-lg'
               >
                  Recent Transactions
               </span>
               <Button
                  class={[
                     'duration-bit-slower transition-[opacity,translate]',
                     'button-bare opacity-0 translate-y-0.5 ease-out justify-self-end self-center',
                     { 'opacity-100 translate-y-0!': isStuckToTop }
                  ]}
               >
                  <Search class='h-1 w-1 [&_path]:stroke-2' />
               </Button>
            </h4>
         </Sticky>
         <div class='pb-3 w-full -mt-0.75'>
            <TransactionListing />
         </div>
      </>
   )
}
