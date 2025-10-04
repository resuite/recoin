import { Icon } from '@/components/icons'
import { For } from 'retend'
import { useRouter } from 'retend/router'
import { createLinkAnimationValues } from './animations'
import type {
   AnimatedLinkGroupProps,
   SidebarDividerProps,
   SidebarHeaderProps,
   SidebarLinkProps
} from './types'

export function SidebarLink(props: SidebarLinkProps) {
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
            <div class='link-icon'>
               <Icon name={link.icon} />
            </div>
            {link.name}
         </div>
      </Link>
   )
}

export function AnimatedLinkGroup(props: AnimatedLinkGroupProps) {
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

export function SidebarDivider(props: SidebarDividerProps) {
   const { scaleValue } = props
   return (
      <div
         class='h-[2.5dvh] border-b-[3px] opacity-[0.5] ml-1 mx-2'
         style={{ scale: `${scaleValue} 1`, transformOrigin: '0 0' }}
      />
   )
}

export function SidebarHeader(props: SidebarHeaderProps) {
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
