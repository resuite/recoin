import type { Category, TransactionType } from '@/api/database/types'
import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import Loader from '@/components/icons/svg/loader'
import { Button } from '@/components/ui/button'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import { getExpenseCategories, getIncomeCategories } from '@/data'
import { BackButton } from '@/pages/app/(fragments)/back-btn'
import { usePromise } from '@/utilities/composables/use-promise'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { For, Switch } from 'retend'
import { useRouteQuery } from 'retend/router'

const CategoryLink = (props: Category) => {
   const { name, icon, id } = props
   const { add: setCategory } = useRouteQueryControl(QueryKeys.TransactionFlow.Category, id)

   return (
      <li>
         <Button
            onClick={setCategory}
            class='btn-link grid grid-cols-[auto_1fr] gap-0.5 items-center'
         >
            <Icon name={icon} class='h-1.5' />
            <div class='self-center justify-self-start text-big'>{name}</div>
         </Button>
      </li>
   )
}

interface CategoryListingProps {
   type: TransactionType
   categories: Array<Category>
}

const CategoriesListing = (props: CategoryListingProps) => {
   const { type, categories } = props
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'
   return (
      <>
         <h2 class='border-b-2 w-full grid gap-x-0.5 gap-y-0.25 grid-rows-[1fr_.5fr] grid-cols-[auto_1fr]'>
            <Arrows class='h-1.5 row-span-2 self-center' direction={arrowDirection} />
            <span class='text-title'>
               {Switch(type, {
                  expense: () => <>Expense</>,
                  income: () => <>Income</>
               })}
            </span>
            <sub class='text-normal'>Choose an {type} category.</sub>
         </h2>
         <FadeScrollView class='pt-0.5 max-h-[55dvh]'>
            <ul>{For(categories, CategoryLink)}</ul>
         </FadeScrollView>
      </>
   )
}

const ChooseCategory = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as 'income' | 'expense'
   const getCategories = type === 'income' ? getIncomeCategories : getExpenseCategories
   const categories = usePromise(getCategories)

   return (
      <div class='grid place-items-center place-content-center grid-cols-1 relative px-1'>
         <BackButton class='absolute top-2 left-1' />
         {Switch.OnProperty(categories, 'state', {
            error: () => <>Could not load categories.</>,
            pending: () => <Loader class='h-2' />,
            complete: ({ data: categories }) => (
               <CategoriesListing type={type} categories={categories} />
            )
         })}
      </div>
   )
}

export default ChooseCategory
