import { Button } from '@/components/ui/button'
import { QueryControlledBottomSheet } from '@/components/views'
import { useRouteQuery } from 'retend/router'

const BottomSheetTest = () => {
   const query = useRouteQuery()
   const sheetKey = 'sheetIsOpen'

   const openSheet = () => {
      query.set(sheetKey, 'true')
   }

   const closeSheet = () => {
      query.delete(sheetKey)
   }

   return (
      <div class='h-screen grid place-items-center light-scheme rounded-t-3xl'>
         <Button type='button' onClick={openSheet}>
            Open Bottom Sheet
         </Button>
         <QueryControlledBottomSheet class='light-scheme' queryKey={sheetKey}>
            {() => (
               <div class='h-full w-full grid place-items-center place-content-center'>
                  <h2 class='text-header'>Bottom Sheet Content.</h2>
                  <p class='mb-1'>This is the content of the bottom sheet.</p>
                  <Button type='button' onClick={closeSheet}>
                     Close Sheet
                  </Button>
               </div>
            )}
         </QueryControlledBottomSheet>
      </div>
   )
}

export default BottomSheetTest
