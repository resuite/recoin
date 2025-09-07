import Loader from '@/components/icons/svg/loader'
import { Button } from '@/components/ui/button'
import { QueryControlledBottomSheet } from '@/components/views'
import { Header } from '@/pages/app/$fragments/header'
import { AddNewTransactionButton } from '@/pages/app/home/$fragments/add-new-transaction-button'
import { useAuthContext } from '@/scopes/auth'
import { useRouteQueryControl } from '@/utilities/composables'
import { If } from 'retend'
import { useRouter } from 'retend/router'

const Home = () => {
   const router = useRouter()
   const { userData, logOut } = useAuthContext()
   const { add } = useRouteQueryControl('sheet')

   const goToStyleguide = () => {
      router.navigate('/styleguide')
   }

   return (
      <div class='grid grid-rows-[auto_1fr] translate-0 h-full'>
         <Header />
         <main class='grid grid-rows-[auto_auto_1fr] justify-center'>
            <h3 class='text-header text-center'>Hello, {userData.get()?.firstName}.</h3>
            <p class='text-sm opacity-60 text-center'>Add a new transaction to get started.</p>

            <div class='grid place-content-center'>
               <Button onClick={goToStyleguide}>Go to styleguide</Button>
               <Button class='gap-0.25' onClick={logOut.run} disabled={logOut.pending}>
                  {If(logOut.pending, () => (
                     <Loader class='btn-icon' />
                  ))}
                  Log Out
               </Button>
               <Button onClick={add}>Open sheet</Button>
               <QueryControlledBottomSheet
                  class='bg-white flex items-center justify-center'
                  queryKey='sheet'
               >
                  {() => <div>Drawer Content.</div>}
               </QueryControlledBottomSheet>
            </div>
         </main>
         <AddNewTransactionButton />
      </div>
   )
}

export default Home
