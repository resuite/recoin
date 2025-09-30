import { Button } from '@/components/ui/button'
import { QueryControlledBottomSheet } from '@/components/views/bottom-sheet-view'
import { Stage } from '@/pages/app/(fragments)/stage'
import { useRouteQuery } from 'retend/router'

export default function Chat() {
   const query = useRouteQuery()

   const openSheet = () => {
      query.set('chatSheet', 'true')
   }

   const closeSheet = () => {
      query.delete('chatSheet')
   }

   return (
      <Stage class='grid place-items-center'>
         <div class='text-center'>
            <h1 class='text-title mb-2'>Chat</h1>
            <p class='text-body'>Coming soon...</p>
            <Button onClick={openSheet} class='mt-2'>
               Open Chat Options
            </Button>
         </div>
         <QueryControlledBottomSheet queryKey='chatSheet' class='light-scheme'>
            {() => (
               <div class='h-full w-full grid place-items-center place-content-center'>
                  <h2 class='text-header'>Chat Options</h2>
                  <p class='mb-1'>Chat settings and options will go here.</p>
                  <Button onClick={closeSheet}>Close</Button>
               </div>
            )}
         </QueryControlledBottomSheet>
      </Stage>
   )
}
