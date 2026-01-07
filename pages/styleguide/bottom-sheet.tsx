import { Cell } from 'retend'
import { useRouteQuery } from 'retend/router'
import { BottomSheetGlobalScope, QueryControlledBottomSheet } from '@/components/bottom-sheet-view'
import { Button } from '@/components/button'
import { ThemeProvider } from '@/scopes/theme'

const BottomSheetTest = () => {
   const query = useRouteQuery()
   const sheetKey = 'sheetIsOpen'

   const bottomSheetCtx = {
      isOpen: Cell.source(false)
   }

   const openSheet = () => {
      query.set(sheetKey, 'true')
   }

   const closeSheet = () => {
      query.delete(sheetKey)
   }

   return (
      <BottomSheetGlobalScope.Provider value={bottomSheetCtx}>
         {() => (
            <ThemeProvider scheme='light'>
               {() => (
                  <div class='h-screen grid place-items-center rounded-t-3xl'>
                     <Button type='button' onClick={openSheet}>
                        Open Bottom Sheet
                     </Button>
                     <QueryControlledBottomSheet queryKey={sheetKey}>
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
               )}
            </ThemeProvider>
         )}
      </BottomSheetGlobalScope.Provider>
   )
}

export default BottomSheetTest
