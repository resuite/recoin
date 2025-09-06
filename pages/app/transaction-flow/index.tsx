import { Button } from '@/components/ui/button'
import { useRouteQueryControl } from '@/utilities/composables'

export const TransactionFlowQuery = 'transactionFlowIsOpen'

const TransactionFlow = () => {
   const { remove: closeTransactionFlow } = useRouteQueryControl(TransactionFlowQuery)

   return (
      <p>
         Hello world.
         <Button onClick={closeTransactionFlow}>Close</Button>.
      </p>
   )
}

export default TransactionFlow
