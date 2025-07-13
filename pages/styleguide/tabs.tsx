import { TabSwitcherView } from '@/components/views'

const Tabs = () => {
   return (
      <div class='py-1 w-full h-screen grid grid-rows-[auto_1fr] light-scheme rounded-t-3xl'>
         <h2 class='text-title px-1'>Tabs</h2>
         <TabSwitcherView
            class='tab-container'
            header:class='px-1'
            tabs={tabs}
         />
      </div>
   )
}

const tabs = [
   {
      heading: () => {
         return 'Tab 1'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 1
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 2'
      },
      body: () => {
         return (
            <div class='flex h-full items-center justify-center w-full'>
               Tab 2
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 3'
      },
      body: () => {
         return (
            <div class='flex h-full items-center justify-center w-full'>
               Tab 3
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 4'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 4
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 5'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 5
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 6'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 6
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 7'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 7
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 8'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 8
            </div>
         )
      }
   },
   {
      heading: () => {
         return 'Tab 9'
      },
      body: () => {
         return (
            <div class='flex items-center justify-center w-full h-full'>
               Tab 9
            </div>
         )
      }
   }
]

export default Tabs
