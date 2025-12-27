import { type Cell, For } from 'retend'
import { useRouteQuery } from 'retend/router'
import type { TransactionType } from '@/api/database/types'
import { Icon } from '@/components/icons'
import ArrowBottomLeft from '@/components/icons/svg/arrow-bottom-left'
import ArrowTopRight from '@/components/icons/svg/arrow-top-right'
import { Button } from '@/components/ui/button'
import { ScrollView } from '@/components/views/scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import { BackButton } from '@/pages/app/(fragments)/back-btn'
import { TransactionTypeName } from '@/pages/app/(fragments)/transaction-type-name'
import { useCategories } from '@/utilities/composables/use-categories'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'

const CategoryLink = (props: Category) => {
   const { name, icon, id } = props
   const { add: setCategory } = useRouteQueryControl(QueryKeys.TransactionFlow.Category, id)

   return (
      <li>
         <Button
            onClick={setCategory}
            class='btn-link grid grid-cols-[auto_1fr] gap-0.5 items-center'
         >
            <div class='h-1.5 w-1.5'>
               <Icon name={icon} class='h-1.5' />
            </div>
            <div class='self-center justify-self-start text-big'>{name}</div>
         </Button>
      </li>
   )
}

interface CategoryListingProps {
   type: TransactionType
   categories: Cell<Array<Category>>
}

const CategoriesListing = (props: CategoryListingProps) => {
   const { type, categories } = props
   const Arrow = type === 'income' ? ArrowBottomLeft : ArrowTopRight
   return (
      <>
         <h2 class='border-b-2 w-full grid gap-x-0.5 gap-y-0.25 grid-rows-[1fr_.5fr] grid-cols-[auto_1fr]'>
            <Arrow class='h-1.5 row-span-2 self-center' />
            <span class='text-title'>
               <TransactionTypeName type={type} />.
            </span>
            <sub class='text-normal'>Choose an {type} category.</sub>
         </h2>
         <ScrollView class='pt-0.5 max-h-[55dvh]'>
            {() => <ul>{For(categories, CategoryLink)}</ul>}
         </ScrollView>
      </>
   )
}

const ChooseCategory = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as TransactionType
   const categories = useCategories(type)

   return (
      <div class='grid place-items-center place-content-center grid-cols-1 relative px-1'>
         <BackButton class='absolute top-1 mt-(--safe-area-inset-top) left-1' />
         <CategoriesListing type={type} categories={categories} />
      </div>
   )
}

export default ChooseCategory
