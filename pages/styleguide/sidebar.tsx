import { Icon, type IconName } from '@/components/icons'
import {
   QueryControlledBottomSheet,
   StackView,
   StackViewGroup,
   useSidebar
} from '@/components/views'
import { createPartitions } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell, For } from 'retend'
import { useRouter } from 'retend/router'
import FloatingActionButtonTest from './fab'
import PullToRefreshViewTest from './pull-zone'

interface LinkInfo {
   name: string
   icon: IconName
}

const page2IsOpen = Cell.source(false)
const page3IsOpen = Cell.source(false)

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
   const { SidebarProviderView } = useSidebar()
   const { add: openSheet, remove: closeSheet } = useRouteQueryControl(sheetKey)

   const contentTopMarkerRef = Cell.source<HTMLElement | null>(null)

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
      <div>
         <PullToRefreshViewTest contentTopMarkerRef={contentTopMarkerRef}>
            <SidebarProviderView
               class='h-screen dark-scheme'
               sidebar={InnerSidebar}
            >
               <FloatingActionButtonTest>
                  <StackTest
                     openSheet={openSheet}
                     contentTopMarkerRef={contentTopMarkerRef}
                  />
               </FloatingActionButtonTest>
            </SidebarProviderView>
         </PullToRefreshViewTest>
         <Sheet sheetKey={sheetKey} closeSheet={closeSheet} />
      </div>
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

interface SidebarLinkProps {
   link: LinkInfo
   progressValue: string
   height?: string
   isActive?: boolean
   href?: string
}
function SidebarLink(props: SidebarLinkProps) {
   const {
      link,
      progressValue,
      height = '8dvh',
      isActive = false,
      href = '#'
   } = props
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
         <div
            class={['flex items-center gap-0.5', { 'opacity-70': !isActive }]}
         >
            <Icon name={link.icon} class='link-icon' />
            {link.name}
         </div>
      </Link>
   )
}

interface AnimatedLinkGroupProps {
   links: LinkInfo[]
   progressValues: string[]
   linkHeight?: string
   activeIndex?: number
}
function AnimatedLinkGroup(props: AnimatedLinkGroupProps) {
   const { links, progressValues, linkHeight = '8dvh', activeIndex = 0 } = props
   return (
      <div
         class='grid'
         style={{ gridTemplateRows: `repeat(${links.length}, auto) 1fr` }}
      >
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

interface SidebarDividerProps {
   scaleValue: string
}
const SidebarDivider = (props: SidebarDividerProps) => {
   const { scaleValue } = props
   return (
      <div
         class='h-[2.5dvh] border-b-[3px] opacity-[0.5] ml-1 mx-2'
         style={{ scale: `${scaleValue} 1`, transformOrigin: '0 0' }}
      />
   )
}

interface SidebarHeaderProps {
   title?: string
   className?: string
   progressValue?: string
}
const SidebarHeader = (props: SidebarHeaderProps) => {
   const { title = 'recoin.', className = 'pl-1 pb-1', progressValue } = props
   const { translate, opacity } = progressValue
      ? createLinkAnimationValues(progressValue)
      : { translate: undefined, opacity: undefined }

   return (
      <h2
         class={[
            className,
            'ease-out duration-slow transition-[translate,opacity]'
         ]}
         style={{ translate, opacity }}
      >
         {title}
      </h2>
   )
}

interface SheetProps {
   closeSheet: () => void
   sheetKey: string
}
function Sheet(props: SheetProps) {
   const { closeSheet, sheetKey } = props

   const SheetContent = () => {
      return (
         <div class='h-full w-full grid place-items-center place-content-center px-2'>
            <h2 class='text-header'>Bottom Sheet Content.</h2>
            <p class='mb-1 text-center'>
               This is the content of the bottom sheet on the sidebar page.
            </p>
            <button type='button' onClick={closeSheet}>
               Close Sheet
            </button>
         </div>
      )
   }

   return (
      <QueryControlledBottomSheet
         class='light-scheme'
         queryKey={sheetKey}
         content={SheetContent}
      />
   )
}

interface StackTestProps {
   contentTopMarkerRef: Cell<HTMLElement | null>
   openSheet: () => void
}
function StackTest(props: StackTestProps) {
   const { openSheet, contentTopMarkerRef } = props

   const Page1 = () => {
      return (
         <div class='h-full w-full relative grid place-items-center place-content-center gap-0.5'>
            <div
               ref={contentTopMarkerRef}
               class='h-0.25 fixed top-0 left-0 w-full'
            />
            <h1 class='text-header'>recoin.</h1>
            <button type='button' onClick={openSheet}>
               Open Bottom Sheet
            </button>
            <button
               type='button'
               onClick={() => {
                  page2IsOpen.set(true)
               }}
            >
               Next Page
               <Icon name='caret' direction='right' class='btn-icon' />
            </button>
         </div>
      )
   }

   const Page2 = () => {
      return (
         <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
            <div class='mb-2'>2</div>
            <button
               type='button'
               onClick={() => {
                  page2IsOpen.set(false)
               }}
            >
               <Icon name='caret' direction='left' class='btn-icon' />
               Go back to page 1
            </button>
            <button
               type='button'
               onClick={() => {
                  page3IsOpen.set(true)
               }}
            >
               Next Page
               <Icon name='caret' direction='right' class='btn-icon' />
            </button>
         </div>
      )
   }

   const Page3 = () => {
      return (
         <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
            <div class='mb-2'>3</div>
            <button
               type='button'
               onClick={() => {
                  page3IsOpen.set(false)
               }}
            >
               <Icon name='caret' direction='left' class='btn-icon' />
               Go back to page 2
            </button>
         </div>
      )
   }

   return (
      <StackViewGroup class='h-full w-full text-large'>
         <StackView class='bg-sky-300' root content={Page1} />
         <StackView
            isOpen={page2IsOpen}
            onCloseRequested={() => {
               page2IsOpen.set(false)
            }}
            content={Page2}
         />
         <StackView
            isOpen={page3IsOpen}
            onCloseRequested={() => {
               page3IsOpen.set(false)
            }}
            content={Page3}
         />
      </StackViewGroup>
   )
}

export default SidebarTest
