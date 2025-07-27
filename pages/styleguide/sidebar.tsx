import { Icon, type IconName } from '@/components/icons'
import {
   QueryControlledBottomSheet,
   SidebarProviderView,
   StackView,
   StackViewGroup,
   useSidebar
} from '@/components/views'
import { createPartitions } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell, For, type SourceCell, createScope, useScopeContext } from 'retend'
import { useRouter } from 'retend/router'
import FloatingActionButtonTest from './fab'
import PullToRefreshViewTest from './pull-zone'

interface LinkInfo {
   name: string
   icon: IconName
}

interface ScopeData {
   page2IsOpen: SourceCell<boolean>
   page3IsOpen: SourceCell<boolean>
   page4IsOpen: SourceCell<boolean>
   contentTopMarkerRef: Cell<HTMLElement | null>
   openSheet: () => void
   closeSheet: () => void
   sheetKey: string
}

interface SidebarLinkProps {
   link: LinkInfo
   progressValue: string
   height?: string
   isActive?: boolean
   href?: string
}

interface AnimatedLinkGroupProps {
   links: LinkInfo[]
   progressValues: string[]
   linkHeight?: string
   activeIndex?: number
}

interface SidebarHeaderProps {
   title?: string
   className?: string
   progressValue?: string
}

interface SidebarDividerProps {
   scaleValue: string
}

const Scope = createScope<ScopeData>()

const upperLinks: Array<LinkInfo> = [
   { name: 'Home', icon: 'house' },
   { name: 'Chat', icon: 'sparkle' },
   { name: 'Reports', icon: 'chart' },
   { name: 'Budgets', icon: 'pie-chart' },
   { name: 'Categories', icon: 'grid' },
   { name: 'Profile', icon: 'profile' }
]

const lowerLinks: Array<LinkInfo> = [
   { name: 'Feedback', icon: 'chat-bubble' },
   { name: 'Settings', icon: 'settings' }
]

function SidebarTest() {
   const sheetKey = 'sidebarSheetIsOpen'
   const sidebarRevealCssVar = 'var(--sidebar-reveal)'

   const { add: openSheet, remove: closeSheet } = useRouteQueryControl(sheetKey)

   const contentTopMarkerRef = Cell.source<HTMLElement | null>(null)
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
   const [headerProgressValue] = createPartitions(
      sidebarRevealCssVar,
      headerAnimationOptions
   )
   const scopeData: ScopeData = {
      page2IsOpen,
      page3IsOpen,
      page4IsOpen,
      contentTopMarkerRef,
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
            <>
               <PullToRefreshViewTest contentTopMarkerRef={contentTopMarkerRef}>
                  <SidebarProviderView
                     class='h-screen dark-scheme'
                     sidebar={InnerSidebar}
                  >
                     {() => (
                        <FloatingActionButtonTest>
                           <StackTest />
                        </FloatingActionButtonTest>
                     )}
                  </SidebarProviderView>
               </PullToRefreshViewTest>
               <Sheet />
            </>
         )}
      </Scope.Provider>
   )
}

function SidebarLink(props: SidebarLinkProps) {
   const { link, progressValue, height = '8dvh', isActive = false, href = '#' } = props
   const { Link } = useRouter()
   const { translate, opacity } = createLinkAnimationValues(progressValue)

   return (
      <Link
         href={href}
         class={[
            'border-none py-0.5 px-1 ease-out duration-slow transition-[translate,opacity] gap-[10px]',
            'active:bg-gray-100/0.5'
         ]}
         style={{ translate, opacity, height }}
      >
         <div class={['flex items-center gap-0.5', { 'opacity-70': !isActive }]}>
            <Icon name={link.icon} class='link-icon' />
            {link.name}
         </div>
      </Link>
   )
}

function AnimatedLinkGroup(props: AnimatedLinkGroupProps) {
   const { links, progressValues, linkHeight = '8dvh', activeIndex = 0 } = props
   return (
      <div class='grid' style={{ gridTemplateRows: `repeat(${links.length}, auto) 1fr` }}>
         {For(links, (link, index) => {
            const progressIndex = index.get()
            const isActive = progressIndex === activeIndex

            return (
               <SidebarLink
                  link={link}
                  progressValue={progressValues[progressIndex]}
                  height={linkHeight}
                  isActive={isActive}
                  href='#'
               />
            )
         })}
      </div>
   )
}

function SidebarDivider(props: SidebarDividerProps) {
   const { scaleValue } = props
   return (
      <div
         class='h-[2.5dvh] border-b-[3px] opacity-[0.5] ml-1 mx-2'
         style={{ scale: `${scaleValue} 1`, transformOrigin: '0 0' }}
      />
   )
}

function SidebarHeader(props: SidebarHeaderProps) {
   const { title = 'recoin.', className = 'pl-1 pb-1', progressValue } = props
   const { translate, opacity } = progressValue
      ? createLinkAnimationValues(progressValue)
      : { translate: undefined, opacity: undefined }

   return (
      <h2
         class={[className, 'ease-out duration-slow transition-[translate,opacity]']}
         style={{ translate, opacity }}
      >
         {title}
      </h2>
   )
}

function Sheet() {
   const { closeSheet, sheetKey } = useScopeContext(Scope)

   return (
      <QueryControlledBottomSheet class='light-scheme' queryKey={sheetKey}>
         {() => (
            <div class='h-full w-full grid place-items-center place-content-center px-2'>
               <h2 class='text-header'>Bottom Sheet Content.</h2>
               <p class='mb-1 text-center'>
                  This is the content of the bottom sheet on the sidebar page.
               </p>
               <button type='button' onClick={closeSheet}>
                  Close Sheet
               </button>
            </div>
         )}
      </QueryControlledBottomSheet>
   )
}

function StackTest() {
   const { openSheet, contentTopMarkerRef, page2IsOpen, page3IsOpen, page4IsOpen } =
      useScopeContext(Scope)
   const { toggleSidebar } = useSidebar()

   const toggleSecondPage = () => {
      page2IsOpen.set(!page2IsOpen.get())
   }

   const toggleThirdPage = () => {
      page3IsOpen.set(!page3IsOpen.get())
   }

   const toggleFourthPage = () => {
      page4IsOpen.set(!page4IsOpen.get())
   }

   return (
      <StackViewGroup class='h-full w-full text-large'>
         <StackView class='bg-sky-300' root>
            {() => (
               <div class='h-full w-full relative grid place-items-center place-content-center gap-0.5'>
                  <div
                     ref={contentTopMarkerRef}
                     class='h-0.25 fixed top-0 left-0 w-full'
                  />
                  <h1 class='text-header'>recoin.</h1>
                  <button type='button' onClick={toggleSidebar}>
                     Toggle Sidebar
                  </button>
                  <button type='button' onClick={openSheet}>
                     Open Bottom Sheet
                  </button>
                  <button type='button' onClick={toggleSecondPage}>
                     Next Page
                     <Icon name='caret' direction='right' class='btn-icon' />
                  </button>
               </div>
            )}
         </StackView>
         <StackView isOpen={page2IsOpen} onCloseRequested={toggleSecondPage}>
            {() => (
               <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                  <div class='mb-2'>2</div>
                  <button type='button' onClick={toggleSecondPage}>
                     <Icon name='caret' direction='left' class='btn-icon' />
                     Go back to page 1
                  </button>
                  <button type='button' onClick={toggleThirdPage}>
                     Next Page
                     <Icon name='caret' direction='right' class='btn-icon' />
                  </button>
               </div>
            )}
         </StackView>
         <StackView isOpen={page3IsOpen} onCloseRequested={toggleThirdPage}>
            {() => (
               <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                  <div class='mb-2'>3</div>
                  <button type='button' onClick={toggleThirdPage}>
                     <Icon name='caret' direction='left' class='btn-icon' />
                     Go back to page 2
                  </button>
                  <button type='button' onClick={toggleFourthPage}>
                     Next Page
                     <Icon name='caret' direction='right' class='btn-icon' />
                  </button>
               </div>
            )}
         </StackView>
         <StackView isOpen={page4IsOpen} onCloseRequested={toggleFourthPage}>
            {() => (
               <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                  <div class='mb-2'>4</div>
                  <button type='button' onClick={toggleFourthPage}>
                     <Icon name='caret' direction='left' class='btn-icon' />
                     Go back to page 3
                  </button>
               </div>
            )}
         </StackView>
      </StackViewGroup>
   )
}

function createLinkAnimationValues(progressValue: string) {
   const translate = Cell.derived(() => {
      return `calc(-15% + ${progressValue} * 15%)`
   })

   const opacity = Cell.derived(() => {
      return progressValue
   })

   return { translate, opacity }
}

export default SidebarTest
