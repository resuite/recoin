import { Coin } from '@/components/ui/coin'

const CoinTest = () => {
   return (
      <div class='h-screen grid place-content-center dark-scheme'>
         <h2 class='text-header mb-2 text-center'>Coin</h2>
         <div class='flex items-center gap-4'>
            <Coin icon='bigger-calendar' />
            <Coin icon='atom' spinning />
         </div>
         <p class='mt-2 text-body'>A standard coin and a spinning coin.</p>
      </div>
   )
}
export default CoinTest
