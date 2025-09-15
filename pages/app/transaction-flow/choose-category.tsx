import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import { type Category, defaultExpenseCategories, defaultIncomeCategories } from '@/data'
import { BackButton } from '@/pages/app/$fragments/back-btn'
import { useRouteQueryControl } from '@/utilities/composables'
import { For, Switch } from 'retend'
import { useRouteQuery } from 'retend/router'

const CategoryLink = (props: Category) => {
   const { name, icon, key } = props
   const { add: setCategory } = useRouteQueryControl(QueryKeys.TransactionFlow.Category, key)

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

const ChooseCategory = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as 'income' | 'expense'
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'

   return (
      <div class='grid place-items-center place-content-center grid-cols-1 relative px-1'>
         <BackButton />
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
            <ul>
               {Switch(type, {
                  expense: () => For(defaultExpenseCategories, CategoryLink),
                  income: () => For(defaultIncomeCategories, CategoryLink)
               })}
            </ul>
         </FadeScrollView>
      </div>
   )
}

export default ChooseCategory
