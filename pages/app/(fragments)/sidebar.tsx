import type { IconName } from '@/components/icons'
import { Icon } from '@/components/icons'
import { useSidebarContext } from '@/components/views/sidebar-provider-view'
import { createPartitions } from '@/utilities/animations'
import { Cell, For } from 'retend'
import { useRouter } from 'retend/router'

export interface LinkInfo {
   name: string
   href: string
   icon: IconName
}

export interface SidebarLinkProps {
   link: LinkInfo
   progressValue: string
   height?: string
   href?: string
}

export interface AnimatedLinkGroupProps {
   links: Array<LinkInfo>
   progressValues: Array<string>
   linkHeight?: string
}

export interface SidebarHeaderProps {
   title?: string
   className?: string
   progressValue?: string
}

export interface SidebarDividerProps {
   scaleValue: string
}

const upperLinks: Array<LinkInfo> = [
   { name: 'Home', icon: 'house', href: '/app' },
   { name: 'Chat', icon: 'sparkle', href: '/app/chat' },
   { name: 'Reports', icon: 'chart', href: '/app/reports' },
   { name: 'Budgets', icon: 'pie-chart', href: '/app/budgets' },
   { name: 'Categories', icon: 'grid', href: '/app/categories' },
   { name: 'Profile', icon: 'profile', href: '/app/profile' }
]

const lowerLinks: Array<LinkInfo> = [
   { name: 'Feedback', icon: 'chat-bubble', href: '/app/feedback' },
   { name: 'Settings', icon: 'settings', href: '/app/settings' }
]

export function createLinkAnimationValues(progressValue: string) {
   const translate = Cell.derived(() => {
      return `calc(-15% + ${progressValue} * 15%)`
   })

   const opacity = Cell.derived(() => {
      return progressValue
   })

   return { translate, opacity }
}

function SidebarLink(props: SidebarLinkProps) {
   const { link, progressValue, height = '8dvh' } = props
   const { Link } = useRouter()
   const sidebarCtx = useSidebarContext()
   const { translate, opacity } = createLinkAnimationValues(progressValue)

   const handleAfterNavigate = () => {
      sidebarCtx.toggleSidebar()
   }

   return (
      <Link
         href={link.href}
         class='border-none py-0.5 px-1 ease-out duration-slow transition-[translate,opacity]'
         style={{ translate, opacity, height }}
         onAfterNavigate={handleAfterNavigate}
      >
         <div
            class={[
               'flex items-center gap-0.5 opacity-70',
               '[:not(:has([active]:not([href="/app"])))>[active][href="/app"]>*]:opacity-100',
               '[:is([active]:not([href="/app"]))>*]:opacity-100'
            ]}
         >
            <Icon name={link.icon} class='link-icon' />
            {link.name}
         </div>
      </Link>
   )
}

function AnimatedLinkGroup(props: AnimatedLinkGroupProps) {
   const { links, progressValues, linkHeight = '8dvh' } = props
   return (
      <div class='grid' style={{ gridTemplateRows: `repeat(${links.length}, auto) 1fr` }}>
         {For(links, (link, index) => {
            const progressIndex = index.get()

            return (
               <SidebarLink
                  link={link}
                  progressValue={progressValues[progressIndex]}
                  height={linkHeight}
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

export function Sidebar() {
   const sidebarRevealCssVar = 'var(--sidebar-reveal)'

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

   return (
      <div class='w-[65dvw] dark-scheme h-full py-2 text-header grid grid-rows-[auto_auto_auto_1fr]'>
         <SidebarHeader progressValue={headerProgressValue} />
         <AnimatedLinkGroup
            links={upperLinks}
            progressValues={upperLinksSwipeProgressValues}
            linkHeight='8dvh'
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
            />
         </div>
      </div>
   )
}
