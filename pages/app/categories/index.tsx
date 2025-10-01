import type { TransactionType } from '@/api/database/types'
import { Icon } from '@/components/icons'
import Add from '@/components/icons/svg/add'
import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { type Tab, TabSwitcherView } from '@/components/views/tab-switcher-view'
import { QueryKeys } from '@/constants/query-keys'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'
import AddNewCategorySheet from '@/pages/app/categories/add-new-category'
import { useCategories } from '@/utilities/composables/use-categories'
import { For } from 'retend'
import { useRouteQuery } from 'retend/router'

interface CategoryListProps {
   type: TransactionType
   onAddCategoryClick: (type: TransactionType) => void
}

const CategoryList = (props: CategoryListProps) => {
   const { type, onAddCategoryClick } = props
   const categories = useCategories(type)

   return (
      <ul class='w-full p-1'>
         {For(
            categories,
            (category) => (
               <li class='grid grid-cols-[auto_1fr] items-center gap-0.5 border-b-2 py-0.5'>
                  <div class='h-1.5 w-1.5'>
                     <Icon name={category.icon} class='h-1.5 w-1.5' />
                  </div>
                  <span class='text-big'>{category.name}</span>
               </li>
            ),
            { key: 'id' }
         )}
         <li class='border-b-2 '>
            <Button
               class={[
                  'grid grid-cols-[auto_1fr] grid-rows-1 items-center',
                  ' py-0.5 gap-0.5 h-full w-full button-bare text-canvas-text text-left'
               ]}
               onClick={() => onAddCategoryClick(type)}
            >
               <Add class='h-1.5 w-1.5' />
               <span class='text-big w-full'>Add Category</span>
            </Button>
         </li>
      </ul>
   )
}

const Categories = () => {
   const query = useRouteQuery()

   const handleAddCategoryClick = (type: TransactionType) => {
      query.set(QueryKeys.Categories.Sheet, type)
      // Implement the logic to add a new category here
   }

   const tabs: Array<Tab> = [
      {
         heading: () => (
            <div class='w-full flex items-center justify-center gap-x-0.25'>
               <Arrows class='h-0.75' direction='bottom-left' />
               Income
            </div>
         ),
         body: () => <CategoryList type='income' onAddCategoryClick={handleAddCategoryClick} />
      },
      {
         heading: () => (
            <div class='w-full flex items-center justify-center gap-x-0.25'>
               <Arrows class='h-0.75' direction='top-right' />
               Expense
            </div>
         ),
         body: () => <CategoryList type='expense' onAddCategoryClick={handleAddCategoryClick} />
      }
   ]

   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         <PageHeading title='Categories' />
         <TabSwitcherView tabs={tabs} header:class='px-1' />
         <AddNewCategorySheet />
      </Stage>
   )
}

export default Categories
