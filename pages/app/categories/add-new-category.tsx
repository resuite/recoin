import { useRouteQuery } from 'retend/router'
import type { TransactionType } from '@/api/database/types'
import { QueryControlledBottomSheet } from '@/components/views/bottom-sheet-view'
import { QueryKeys } from '@/constants/query-keys'
import { BottomSheetHeader } from '@/pages/app/(fragments)/bottom-sheet-header'
import { TransactionTypeName } from '@/pages/app/(fragments)/transaction-type-name'

const Content = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.Categories.Sheet).get() as TransactionType

   return (
      <div class='p-1 pt-2'>
         <BottomSheetHeader subText={`Create a custom category for your ${type} transactions.`}>
            Add <TransactionTypeName type={type} /> Category
         </BottomSheetHeader>
      </div>
   )
}

const AddNewCategorySheet = () => {
   return (
      <QueryControlledBottomSheet queryKey={QueryKeys.Categories.Sheet}>
         {() => <Content />}
      </QueryControlledBottomSheet>
   )
}

export default AddNewCategorySheet
