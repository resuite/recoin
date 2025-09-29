import type { IconName } from '@/components/icons'
import type { SourceCell } from 'retend'

export interface LinkInfo {
   name: string
   icon: IconName
}

export interface ScopeData {
   page2IsOpen: SourceCell<boolean>
   page3IsOpen: SourceCell<boolean>
   page4IsOpen: SourceCell<boolean>
   openSheet: () => void
   closeSheet: () => void
   sheetKey: string
}

export interface SidebarLinkProps {
   link: LinkInfo
   progressValue: string
   height?: string
   isActive?: boolean
   href?: string
}

export interface AnimatedLinkGroupProps {
   links: Array<LinkInfo>
   progressValues: Array<string>
   linkHeight?: string
   activeIndex?: number
}

export interface SidebarHeaderProps {
   title?: string
   className?: string
   progressValue?: string
}

export interface SidebarDividerProps {
   scaleValue: string
}
