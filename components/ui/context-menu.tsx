import type { JSX } from 'retend/jsx-runtime'
import type { IconName } from '../icons'

export const ContextMenuTypes = {
   Radio: 1,
   Check: 2,
   Action: 3,
   Group: 4,
   SubMenu: 5
} as const

export interface ContextMenuItemBase {
   content: () => JSX.Template
   shortcut?: string
   icon?: IconName
   disabled?: JSX.ValueOrCell<boolean>
}

export interface ContextMenuRadioItem extends ContextMenuItemBase {
   type: typeof ContextMenuTypes.Radio
   onChange?: (value: string) => void
}

export interface ContextMenuCheckItem extends ContextMenuItemBase {
   type: typeof ContextMenuTypes.Check
   onChange?: (isChecked: boolean) => void
}

export interface ContextMenuActionItem extends ContextMenuItemBase {
   type: typeof ContextMenuTypes.Action
   onClick?: () => void
}

export interface ContextMenuGroup extends Omit<ContextMenuItemBase, 'content'> {
   type: typeof ContextMenuTypes.Group
   items: ContextMenuItem[]
}

export interface ContextMenuSubMenu extends ContextMenuItemBase {
   type: typeof ContextMenuTypes.SubMenu
   items: ContextMenuItem[]
}

export type ContextMenuItem =
   | ContextMenuRadioItem
   | ContextMenuCheckItem
   | ContextMenuActionItem
   | ContextMenuGroup
   | ContextMenuSubMenu

export function ContextMenuTrigger() {
   return <div>Hello world.</div>
}
