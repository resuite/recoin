import Arrows from '@/components/icons/svg/arrows'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useHrefWithAppendedParams } from '@/utilities/composables'
import { useRouter } from 'retend/router'

const TransactionFlow = () => {
   const { TransactionFlow } = QUERY_KEYS
   const router = useRouter()
   const expenseFlowHref = useHrefWithAppendedParams({ [TransactionFlow.Type]: 'expense' })
   const incomeFlowHref = useHrefWithAppendedParams({ [TransactionFlow.Type]: 'income' })

   return (
      <div class='animate-stagger-load grid item-center px-1 gap-0.5 h-full w-full'>
         <h1 class='text-title w-full place-self-end'>Add a new transaction.</h1>
         <div
            class={[
               'w-full text-title flex flex-col gap-0.75',
               '[&>*]:grid [&>*]:grid-cols-[auto_1fr] [&>*]:gap-0.5'
            ]}
         >
            <router.Link href={expenseFlowHref}>
               <Arrows class='h-1.75' direction='top-right' />
               Expense
            </router.Link>
            <router.Link href={incomeFlowHref}>
               <Arrows class='h-1.75' />
               Income
            </router.Link>
         </div>
      </div>
   )
}

export default TransactionFlow
