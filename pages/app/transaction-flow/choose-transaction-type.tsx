import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { QueryKeys } from '@/constants/query-keys'
import { useRouteQuery } from 'retend/router'

const ChooseTransactionType = () => {
   const query = useRouteQuery()
   const goToExpense = () => {
      query.append(QueryKeys.TransactionFlow.Type, 'expense')
   }

   const goToIncome = () => {
      query.append(QueryKeys.TransactionFlow.Type, 'income')
   }

   return (
      <div
         class={[
            'flex flex-col justify-center items-start',
            'animate-stagger-load items-center text-title px-1 gap-0.5 '
         ]}
      >
         <h1>Add a new transaction.</h1>
         <Button class='btn-link' onClick={goToExpense}>
            <Arrows class='link-icon-large' direction='top-right' />
            Expense
         </Button>
         <Button class='btn-link' onClick={goToIncome}>
            <Arrows class='link-icon-large' direction='bottom-left' />
            Income
         </Button>
      </div>
   )
}

export default ChooseTransactionType
