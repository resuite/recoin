import { Icon, type IconName } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { QueryKeys } from '@/constants/query-keys'
import { BackButton } from '@/pages/app/$fragments/back-btn'
import { For, Switch } from 'retend'
import { useRouteQuery, useRouter } from 'retend/router'

interface CategoryProps {
   name: string
   icon: IconName
}

const defaultCategories: CategoryProps[] = [
   { name: 'Utilities', icon: 'house' },
   {
      name: 'Food and Drinks',
      icon: 'cutlery'
   },
   {
      name: 'Transportation',
      icon: 'car'
   },
   {
      name: 'Health and Personal Care',
      icon: 'healthcare'
   },
   {
      name: 'Financial Obligation',
      icon: 'credit-card'
   }
]

const Category = (props: CategoryProps) => {
   const { name, icon } = props
   const router = useRouter()

   const selectCategory = () => {
      router.params
   }

   return (
      <li>
         <Button
            onClick={selectCategory}
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
   const type = query.get(QueryKeys.TransactionFlow.Type).get()
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'

   return (
      <div class='grid place-items-center place-content-center grid-cols-1 gap-0.5 relative px-1'>
         <BackButton />
         <h2
            class={[
               'border-b-2 w-full',
               'grid gap-x-0.5 gap-y-0.25 grid-rows-[1fr_.5fr] grid-cols-[auto_1fr]'
            ]}
         >
            <Arrows class='h-1.5 row-span-2 self-center' direction={arrowDirection} />
            <span class='text-title'>
               {Switch(type, {
                  expense: () => <>Expense</>,
                  income: () => <>Income</>
               })}
            </span>
            <sub class='text-normal'>Choose an {type} category.</sub>
         </h2>
         <ul class='h-[55dvh] w-full'>{For(defaultCategories, Category)}</ul>
      </div>
   )
}

export default ChooseCategory
