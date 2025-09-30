import { SidebarProviderView } from '@/components/views/sidebar-provider-view'
import { createPartitions } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { Cell } from 'retend'
import PullToRefreshViewTest from '../pull-zone'
import { lowerLinks, upperLinks } from './constants'
import { Scope } from './scope'
import { Sheet } from './sheet'
import { AnimatedLinkGroup, SidebarDivider, SidebarHeader } from './sidebar-components'
import { StackTest } from './stack'
import type { ScopeData } from './types'

function SidebarTest() {
   const sheetKey = 'sidebarSheetIsOpen'
   const sidebarRevealCssVar = 'var(--sidebar-reveal)'

   const { add: openSheet, remove: closeSheet } = useRouteQueryControl(sheetKey)

   const page2IsOpen = Cell.source(false)
   const page3IsOpen = Cell.source(false)
   const page4IsOpen = Cell.source(false)

   const upperLinksSwipeProgressValuesOptions = {
      from: 0.6,
      overlap: 0.2,
      count: upperLinks.length
   }
   const lowerLinksSwipeProgressValuesOptions = {
      from: 0.6,
      overlap: 0.2,
      count: lowerLinks.length
   }
   const lineScaleOptions = { from: 0.7 }
   const headerAnimationOptions = { from: 0.7, to: 0.9 }
   const upperLinksSwipeProgressValues = createPartitions(
      sidebarRevealCssVar,
      upperLinksSwipeProgressValuesOptions
   )
   const lowerLinksSwipeProgressValues = createPartitions(
      sidebarRevealCssVar,
      lowerLinksSwipeProgressValuesOptions
   )
   const [lineScale] = createPartitions(sidebarRevealCssVar, lineScaleOptions)
   const [headerProgressValue] = createPartitions(sidebarRevealCssVar, headerAnimationOptions)
   const scopeData: ScopeData = {
      page2IsOpen,
      page3IsOpen,
      page4IsOpen,
      openSheet,
      closeSheet,
      sheetKey
   }

   const InnerSidebar = () => {
      return (
         <div class='w-[65dvw] dark-scheme h-full py-2 text-header grid grid-rows-[auto_auto_auto_1fr]'>
            <SidebarHeader progressValue={headerProgressValue} />
            <AnimatedLinkGroup
               links={upperLinks}
               progressValues={upperLinksSwipeProgressValues}
               linkHeight='8dvh'
               activeIndex={0}
            />
            <SidebarDivider scaleValue={lineScale} />
            <div
               class='grid pt-auto before:[grid-area:1/1]'
               style={{
                  gridTemplateRows: `1fr repeat(${lowerLinks.length}, auto)`
               }}
            >
               <AnimatedLinkGroup
                  links={lowerLinks}
                  progressValues={lowerLinksSwipeProgressValues}
                  linkHeight='7.5dvh'
                  activeIndex={-1}
               />
            </div>
         </div>
      )
   }

   return (
      <Scope.Provider value={scopeData}>
         {() => (
            <PullToRefreshViewTest>
               {() => (
                  <>
                     <SidebarProviderView class='h-screen dark-scheme' sidebar={InnerSidebar}>
                        {StackTest}
                     </SidebarProviderView>
                     <Sheet />
                  </>
               )}
            </PullToRefreshViewTest>
         )}
      </Scope.Provider>
   )
}

export default SidebarTest
