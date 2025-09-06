import { Button } from '@/components/ui/button'
import { Header } from '@/pages/app/$fragments/header'
import { AddNewTransactionButton } from '@/pages/app/transaction-flow/$fragments/add-new-transaction-button'
import { AuthScope } from '@/scopes/auth'
import { useScopeContext } from 'retend'

const Home = () => {
   const { logOut } = useScopeContext(AuthScope)
   const goToStyleguide = () => {}

   return (
      <>
         <Header />
         <div class='grid place-items-center place-content-center'>
            <Button onClick={goToStyleguide}>Go to styleguide</Button>
            <Button onClick={logOut}>Log Out</Button>
         </div>
         <AddNewTransactionButton />
      </>
   )
}

export default Home
