import { Button } from '@/components/ui/button'
import { Header } from '@/pages/app/$fragments/header'
import { AddNewTransactionButton } from '@/pages/app/transaction-flow/$fragments/add-new-transaction-button'

const Home = () => {
   const goToStyleguide = () => {}

   return (
      <>
         <Header />
         <div class='grid place-items-center'>
            <Button onClick={goToStyleguide}>Go to styleguide</Button>
         </div>
         <AddNewTransactionButton />
      </>
   )
}

export default Home
