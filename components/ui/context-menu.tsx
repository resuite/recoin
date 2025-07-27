import { PopoverView } from '@/components/views'
import { defer } from '@/utilities/miscellaneous'
import { Cell, type SourceCell, createScope, useObserver } from 'retend'
import { createGlobalStateHook } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import type { IconName } from '../icons'

export const ContextMenuTypes = {
   Radio: 1,
   Check: 2,
   Action: 3,
   Group: 4,
   SubMenu: 5
} as const

export type DivProps = JSX.IntrinsicElements['div']

export interface ContextMenuItemBase {
   children: JSX.Template
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

export interface ContextMenuGroup extends Omit<ContextMenuItemBase, 'children'> {
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

interface ContextMenuProps extends DivProps {
   children: () => JSX.Template
   requestClose?: () => void
   /**
    * A reference to the element that triggers the context menu.
    */
   triggerRef: SourceCell<HTMLElement | null>
}

interface ContextMenuScopeData {
   isOpen: Cell<boolean>
   requestClose?: () => void
   triggerRef: SourceCell<HTMLElement | null>
}
const ContextMenuScope = createScope<ContextMenuScopeData>()

interface PointerDownCoordinates {
   x: Cell<number>
   y: Cell<number>
}

const usePointerDownCoordinates = createGlobalStateHook({
   cacheKey: Symbol('usePointerDownCoordinates'),
   createSource: () => ({ x: Cell.source(0), y: Cell.source(0) }),
   setupListeners: (window, cells) => {
      const updatePosition = (event: PointerEvent) => {
         cells.x.set(event.clientX)
         cells.y.set(event.clientY)
      }
      window.addEventListener('pointerdown', updatePosition, { passive: true })
   },
   createReturnValue: (cells): PointerDownCoordinates => ({
      x: Cell.derived(() => cells.x.get()),
      y: Cell.derived(() => cells.y.get())
   })
})

export function ContextMenu(props: ContextMenuProps) {
   const { x, y } = usePointerDownCoordinates()
   const { children, requestClose, triggerRef, ...rest } = props
   const observer = useObserver()

   const ref = Cell.source<HTMLDivElement | null>(null)

   const isOpen = Cell.source(false)

   const value = { isOpen, requestClose, triggerRef }

   const handleClickOutside = (event: PointerEvent) => {
      const popover = ref.get()
      if (popover?.contains(event.target as Node)) {
         return
      }
      isOpen.set(false)
   }

   const handleContextMenuEvent = (event: Event) => {
      event.preventDefault()
      isOpen.set(true)
      defer(() => {
         window.addEventListener('pointerdown', handleClickOutside)
      })
   }

   observer.onConnected(triggerRef, (trigger) => {
      trigger.addEventListener('contextmenu', handleContextMenuEvent)
      return () => {
         trigger.removeEventListener('contextmenu', handleContextMenuEvent)
      }
   })

   return (
      <ContextMenuScope.Provider value={value}>
         {() => (
            <PopoverView
               isOpen={isOpen}
               ref={ref}
               x={x}
               y={y}
               {...(rest as Record<string, unknown>)}
            >
               {children}
            </PopoverView>
         )}
      </ContextMenuScope.Provider>
   )
}
