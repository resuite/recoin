import { Cell, For } from 'retend'
import { useRouter } from 'retend/router'
import type { IconName } from '@/components/icons'
import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useScrollTimelineContext } from '@/components/views/scroll-timeline-view'
import { useSidebarContext } from '@/components/views/sidebar-provider-view'
import { VibrationPatterns } from '@/constants/vibration'
import { vibrate } from '@/utilities/miscellaneous'

export interface LinkInfo {
   name: string
   href: string
   icon: IconName
}

export interface SidebarLinkProps {
   link: LinkInfo
   index: number
}

export interface LinkGroupProps {
   links: Array<LinkInfo>
}

export interface SidebarHeaderProps {
   title?: string
   className?: string
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

function SidebarLink(props: SidebarLinkProps) {
   const { link, index } = props
   const { navigate, getCurrentRoute } = useRouter()
   const currentRoute = getCurrentRoute()
   const sidebarCtx = useSidebarContext()
   const scrollTimeline = useScrollTimelineContext()
   const buttonRef = Cell.source<HTMLButtonElement | null>(null)

   const handleClick = async () => {
      vibrate(VibrationPatterns.ButtonPress)
      await sidebarCtx.toggleSidebar()
      navigate(link.href)
   }

   const isActive = Cell.derived(() => {
      if (link.href === '/app') {
         return currentRoute.get().path === '/app'
      }
      return currentRoute.get().path.startsWith(link.href)
   })

   scrollTimeline.add({
      target: buttonRef,
      keyframes: { translate: ['0%', `-${(index + 1) * 20}%`] }
   })

   return (
      <Button
         ref={buttonRef}
         class='btn-link border-none cursor-pointer py-0.5 px-1 h-[8dvh]'
         onClick={handleClick}
      >
         <div
            class={[
               'flex items-center gap-0.5 text-light-yellow/50',
               'text-xl',
               { '[:is(*)]:text-canvas-text': isActive }
            ]}
         >
            <Icon name={link.icon} class='link-icon' />
            {link.name}
         </div>
      </Button>
   )
}

function LinkGroup(props: LinkGroupProps) {
   const { links } = props
   return (
      <div class='grid' style={{ gridTemplateRows: `repeat(${links.length}, auto) 1fr` }}>
         {For(links, (link, index) => {
            return <SidebarLink link={link} index={index.get()} />
         })}
      </div>
   )
}

function SidebarDivider() {
   const scrollTimeline = useScrollTimelineContext()
   const ref = Cell.source<HTMLHRElement | null>(null)

   scrollTimeline.add({
      target: ref,
      keyframes: { scale: ['1 1', '0 1'] },
      range: { start: 0, end: 0.5 }
   })

   return <div ref={ref} class='h-[2.5dvh] border-b-[3px] opacity-[0.5] ml-1 mx-2' />
}

function SidebarHeader(props: SidebarHeaderProps) {
   const { title = 'recoin.', className = 'pl-1 pb-1' } = props

   return <h2 class={className}>{title}</h2>
}

export function Sidebar() {
   return (
      <div
         style={{
            contain: 'strict',
            containIntrinsicHeight: '100dvh',
            containIntrinsicWidth: '65dvw',
            contentVisibility: 'auto'
         }}
         class={[
            'w-[55dvw] h-screen pt-[calc(env(safe-area-inset-top)+var(--spacing)*1.5)]',
            'dark-scheme h-full pb-2 text-header grid grid-rows-[auto_auto_auto_1fr]'
         ]}
      >
         <SidebarHeader />
         <LinkGroup links={upperLinks} />
         <SidebarDivider />
         <div
            class='grid pt-auto before:[grid-area:1/1]'
            style={{ gridTemplateRows: `1fr repeat(${lowerLinks.length}, auto)` }}
         >
            <LinkGroup links={lowerLinks} />
         </div>
      </div>
   )
}
