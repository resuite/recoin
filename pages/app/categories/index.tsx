import type { TransactionType } from '@/api/database/types'
import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import { type Tab, TabSwitcherView } from '@/components/views/tab-switcher-view'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'
import { useCategories } from '@/utilities/composables/use-categories'
import { For } from 'retend'

interface CategoryListProps {
   type: TransactionType
}

const CategoryList = (props: CategoryListProps) => {
   const { type } = props
   const categories = useCategories(type)

   return (
      <ul class='w-full p-1'>
         {For(
            categories,
            (category) => (
               <li class='grid grid-cols-[auto_1fr_auto] items-center gap-0.5 border-b-2 py-0.5'>
                  <div class='h-1.5 w-1.5'>
                     <Icon name={category.icon} class='h-1.5 w-1.5' />
                  </div>
                  <span class='text-big'>{category.name}</span>
                  <Arrows direction='top-right' class='h-1 w-1' />
               </li>
            ),
            { key: 'id' }
         )}
      </ul>
   )
}

const Categories = () => {
   const tabs: Array<Tab> = [
      {
         heading: () => (
            <div class='w-full flex items-center justify-center gap-x-0.25'>
               <Arrows class='h-0.75' direction='bottom-left' />
               Income
            </div>
         ),
         body: () => <CategoryList type='income' />
      },
      {
         heading: () => (
            <div class='w-full flex items-center justify-center gap-x-0.25'>
               <Arrows class='h-0.75' direction='top-right' />
               Expense
            </div>
         ),
         body: () => <CategoryList type='expense' />
      }
   ]

   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         <PageHeading title='Categories' />
         <TabSwitcherView tabs={tabs} header:class='px-1' />
      </Stage>
   )
}

export default Categories
