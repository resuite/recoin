import { QueryControlledBottomDrawer } from '@/components/views'
import { useRouteQuery } from 'retend/router'

const BottomDrawerTest = () => {
   const query = useRouteQuery()
   const drawerKey = 'drawerIsOpen'

   const openDrawer = () => {
      query.set(drawerKey, 'true')
   }

   const closeDrawer = () => {
      query.delete(drawerKey)
   }

   const Content = () => {
      return (
         <div class='h-full w-full grid place-items-center place-content-center'>
            <h2 class='text-header'>Bottom Drawer Content.</h2>
            <p class='mb-1'>This is the content of the bottom drawer.</p>
            <button type='button' onClick={closeDrawer}>
               Close Drawer
            </button>
         </div>
      )
   }

   return (
      <div class='h-screen grid place-items-center light-scheme rounded-t-3xl'>
         <button type='button' onClick={openDrawer}>
            Open Bottom Drawer
         </button>
         <QueryControlledBottomDrawer
            class='light-scheme'
            queryKey={drawerKey}
            content={Content}
         />
      </div>
   )
}

export default BottomDrawerTest
