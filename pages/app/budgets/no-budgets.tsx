import PieChart from '@/components/icons/svg/pie-chart'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'
import { AddNewBudget } from '@/pages/app/budgets/(fragments)/add-new-budget-button'

const NoBudgetsScreen = () => {
   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         <PageHeading title='Budgets' />
         <div class='opacity-60 grid place-items-center place-content-center text-center pb-5'>
            <PieChart class='h-3' />
            <span class='max-w-[300px]'>
               Track your spending habits. <br />
               Create budgets for categories to stay on top of expenses.
            </span>
            <br />
            <span>Tap + to create one.</span>
         </div>
         <AddNewBudget />
      </Stage>
   )
}

export default NoBudgetsScreen
