import Arrows from '@/components/icons/svg/arrows'
import { TabSwitcherView } from '@/components/views/tab-switcher-view'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'

const tabs = ['Income', 'Expense'].map((type) => {
   const arrowDirection = type === 'Income' ? 'bottom-left' : 'top-right'
   return {
      heading: () => {
         return (
            <div class='w-full flex items-center justify-center gap-x-0.25'>
               <Arrows class='h-0.75' direction={arrowDirection} />
               {type}
            </div>
         )
      },
      body: () => {
         return <div class='flex items-center justify-center w-full h-full'>{type} categories</div>
      }
   }
})

export default function Categories() {
   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         <PageHeading title='Categories' />
         <TabSwitcherView tabs={tabs} header:class='px-1' />
      </Stage>
   )
}
