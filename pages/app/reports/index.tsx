import { TabSwitcherView } from '@/components/views/tab-switcher-view'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'

const tabs = ['Today', 'This Week', 'This Month', 'This Year'].map((timeFrame) => {
   return {
      heading: () => <div class='w-full'>{timeFrame}</div>,
      body: () => {
         return <div class='h-full w-full grid place-items-center'>{timeFrame}</div>
      }
   }
})

const Reports = () => {
   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         <PageHeading title='Reports' />
         <TabSwitcherView
            class='w-full'
            header:class='px-1'
            minTabHeaderWidth='130px'
            tabs={tabs}
         />
      </Stage>
   )
}

export default Reports
