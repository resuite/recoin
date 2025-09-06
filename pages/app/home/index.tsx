import { Button } from '@/components/ui/button'
import { Header } from '@/pages/app/$fragments/header'
import { AddNewTransactionButton } from '@/pages/app/home/$fragments/add-new-transaction-button'
import { AuthScope } from '@/scopes/auth'
import { useScopeContext } from 'retend'

const Home = () => {
   const { logOut } = useScopeContext(AuthScope)
   const goToStyleguide = () => {}

   return (
      <div class='grid grid-rows-[auto_1fr] translate-0 h-full'>
         <Header />
         <main class='grid place-items-center place-content-center'>
            <Button onClick={goToStyleguide}>Go to styleguide</Button>
            <Button onClick={logOut}>Log Out</Button>
         </main>
         <AddNewTransactionButton />
      </div>
   )
}

export default Home
