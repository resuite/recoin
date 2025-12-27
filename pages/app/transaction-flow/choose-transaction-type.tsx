import { useRouteQuery } from 'retend/router'
import ArrowBottomLeft from '@/components/icons/svg/arrow-bottom-left'
import ArrowTopRight from '@/components/icons/svg/arrow-top-right'
import { Button } from '@/components/ui/button'
import { QueryKeys } from '@/constants/query-keys'

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
            <ArrowTopRight class='link-icon-large' />
            Expense
         </Button>
         <Button class='btn-link' onClick={goToIncome}>
            <ArrowBottomLeft class='link-icon-large' />
            Income
         </Button>
      </div>
   )
}

export default ChooseTransactionType
