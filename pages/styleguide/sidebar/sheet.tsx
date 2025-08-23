import { QueryControlledBottomSheet } from '@/components/views'
import { useScopeContext } from 'retend'
import { Scope } from './scope'

export function Sheet() {
   const { closeSheet, sheetKey } = useScopeContext(Scope)

   return (
      <QueryControlledBottomSheet class='light-scheme' queryKey={sheetKey}>
         {() => (
            <div class='h-full w-full grid place-items-center place-content-center px-2'>
               <h2 class='text-header'>Bottom Sheet Content.</h2>
               <p class='mb-1 text-center'>
                  This is the content of the bottom sheet on the sidebar page.
               </p>
               <button type='button' onClick={closeSheet}>
                  Close Sheet
               </button>
            </div>
         )}
      </QueryControlledBottomSheet>
   )
}
