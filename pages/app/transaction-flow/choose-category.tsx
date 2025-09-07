import Arrows from '@/components/icons/svg/arrows'
import { QueryKeys } from '@/constants/query-keys'
import { BackButton } from '@/pages/app/$fragments/back-btn'
import { Switch } from 'retend'
import { useRouteQuery } from 'retend/router'

const ChooseCategory = () => {
   const query = useRouteQuery()
   const type = query.get(QueryKeys.TransactionFlow.Type)
   const arrowDirection = type.get() === 'income' ? 'bottom-left' : 'top-right'

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
               {Switch(type.get(), {
                  expense: () => <>Expense</>,
                  income: () => <>Income</>
               })}
            </span>
            <sub class='text-normal'>Choose an {type.get()} category.</sub>
         </h2>
         <ul class='h-[55dvh] w-full debug'>Hello</ul>
      </div>
   )
}

export default ChooseCategory
