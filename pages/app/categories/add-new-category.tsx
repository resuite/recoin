import type { TransactionType } from '@/api/database/types'
import { QueryControlledBottomSheet } from '@/components/views/bottom-sheet-view'
import { QueryKeys } from '@/constants/query-keys'
import { TransactionTypeName } from '@/pages/app/(fragments)/transaction-type-name'
import { useRouteQuery } from 'retend/router'

const Content = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.Categories.Sheet).get() as TransactionType

   return (
      <div class='p-1 pt-2'>
         <h2 class='text-bigger'>
            Add <TransactionTypeName type={type} /> Category
         </h2>
         <sub class='text-normal'>Create a custom category for your income transactions.</sub>
      </div>
   )
}

const AddNewCategorySheet = () => {
   return (
      <QueryControlledBottomSheet class='light-scheme' queryKey={QueryKeys.Categories.Sheet}>
         {() => <Content />}
      </QueryControlledBottomSheet>
   )
}

export default AddNewCategorySheet
