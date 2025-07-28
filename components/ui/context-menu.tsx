import { PopoverView, generateNewAnchorName } from '@/components/views'
import { defer } from '@/utilities/miscellaneous'
import {
   Cell,
   For,
   If,
   type SourceCell,
   Switch,
   createScope,
   useObserver,
   useScopeContext
} from 'retend'
import { useCursorPosition, useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { DynamicIcon, type IconName } from '../icons'
import Checkmark from '../icons/svg/checkmark'
import styles from './context-menu.module.css'

const SeparatorItemSelector = `.${styles.item}:has(> .${styles.separator})`

export const ItemTypes = {
   Radio: 1,
   Check: 2,
   Action: 3,
   Separator: 4,
   SubMenu: 5
} as const

export const StrategyRelease = {
   mouseover: 'mouseout',
   click: 'click',
   pointerdown: 'pointerup',
   contextmenu: 'click'
} as const satisfies Record<ContextMenuStrategy, string>

interface ContextMenuItemBase {
   label: string | (() => JSX.Template)
   shortcut?: string
   icon?: IconName
   disabled?: JSX.ValueOrCell<boolean>
}

export interface ContextMenuRadioItemProps extends ContextMenuItemBase {
   name: string
   type: typeof ItemTypes.Radio
   value: JSX.ValueOrCell<string>
   onSelect?: (value: string) => void
}

export interface ContextMenuCheckItemProps extends ContextMenuItemBase {
   name: string
   type: typeof ItemTypes.Check
   checked: JSX.ValueOrCell<boolean>
   onCheckedChange?: (isChecked: boolean) => void
}

export interface ContextMenuActionItemProps extends ContextMenuItemBase {
   type: typeof ItemTypes.Action
   onClick?: (event: MouseEvent) => void
}

export interface ContextMenuSeparatorProps {
   type: typeof ItemTypes.Separator
}

export interface ContextMenuSubMenu extends ContextMenuItemBase {
   type: typeof ItemTypes.SubMenu
   items: JSX.ValueOrCell<ContextMenuItemProps[]>
}

export type ContextMenuItemProps =
   | ContextMenuRadioItemProps
   | ContextMenuCheckItemProps
   | ContextMenuActionItemProps
   | ContextMenuSeparatorProps
   | ContextMenuSubMenu
export type ContextMenuStrategy = 'contextmenu' | 'mouseover' | 'pointerdown' | 'click'

interface ContextMenuOptionalIconProps {
   icon?: IconName
}

type MenuProps = JSX.IntrinsicElements['menu']
interface ContextMenuProps extends MenuProps {
   requestClose?: () => void
   /**
    * A reference to the element that triggers the context menu.
    */
   trigger: SourceCell<HTMLElement | null>
   /**
    * An array of context menu items to display.
    */
   items: JSX.ValueOrCell<ContextMenuItemProps[]>
   /**
    * How the opening and closing of the context menu should be managed.
    * It default to using the `contextmenu` event on the trigger
    * @default 'contextmenu'
    */
   strategy?: ContextMenuStrategy
}

interface ContextMenuContext {
   isOpen: Cell<boolean>
   close: () => void
   trigger: SourceCell<HTMLElement | null>
}
const ContextMenuScope = createScope<ContextMenuContext>()

export function useContextMenuContext() {
   return useScopeContext(ContextMenuScope)
}

export function ContextMenu(props: ContextMenuProps) {
   const { trigger, items, strategy = 'contextmenu', class: className, ...rest } = props
   const observer = useObserver()
   const cursorCoordinates = useCursorPosition()

   const ref = Cell.source<HTMLElement | null>(null)
   const anchor = Cell.source<HTMLElement | null>(null)
   const isOpen = Cell.source(false)
   const close = () => {
      isOpen.set(false)
   }
   const context = { isOpen, close, trigger }
   const anchorCoordinates = {
      x: Cell.source(0),
      y: Cell.source(0)
   }
   const anchorName = generateNewAnchorName()
   const anchorStyle = Cell.derived(() => {
      return {
         anchorName,
         top: `${anchorCoordinates.y.get()}px`,
         left: `${anchorCoordinates.x.get()}px`
      }
   })

   const closeContextMenu = (event?: Event) => {
      if (!event) {
         isOpen.set(false)
         return
      }
      if (event.type !== 'resize' && ref.get()?.contains(event.target as Node)) {
         return
      }
      isOpen.set(false)
      window.removeEventListener(event.type, closeContextMenu)
      window.removeEventListener('resize', closeContextMenu)
   }

   const handleKeybindings = (event: KeyboardEvent) => {
      if (event.code === 'Tab') {
         return
      }
      if (event.code === 'Escape') {
         closeContextMenu()
         return
      }
      const menu = ref.peek()
      if (!menu) {
         return
      }

      const focusedElement = document.activeElement
      if (!focusedElement || !menu.contains(focusedElement)) {
         getFocusableElementInItem(menu)?.focus()
         return
      }

      let targetItem: Element | null | undefined
      const closestMenuItem = focusedElement.closest(`.${styles.item}`)
      switch (event.code) {
         case 'ArrowDown':
            targetItem = closestMenuItem?.nextElementSibling
            while (targetItem?.matches(SeparatorItemSelector)) {
               targetItem = targetItem.nextElementSibling
            }
            break
         case 'ArrowUp':
            targetItem = closestMenuItem?.previousElementSibling
            while (targetItem?.matches(SeparatorItemSelector)) {
               targetItem = targetItem.previousElementSibling
            }
      }

      if (targetItem instanceof HTMLElement) {
         getFocusableElementInItem(targetItem)?.focus()
      }
   }

   const setAnchorCoordinates = (x: number, y: number) => {
      Cell.batch(() => {
         anchorCoordinates.x.set(x)
         anchorCoordinates.y.set(y)
      })
   }

   const openContextMenu = async (event: Event) => {
      const newX = cursorCoordinates.x.get()
      const newY = cursorCoordinates.y.get()

      if (event.type === 'contextmenu') {
         event.preventDefault()
      }

      const isAlreadyOpen = isOpen.get()
      if (!isAlreadyOpen) {
         setAnchorCoordinates(newX, newY)
         isOpen.set(true)
         defer(() => {
            window.addEventListener(StrategyRelease[strategy], closeContextMenu)
            window.addEventListener('keydown', handleKeybindings)
            window.addEventListener('resize', closeContextMenu)
         })
         return
      }

      // If the menu is already open, we can just smoothly animate it
      // to its new position. (using translations, because compositing.)
      const oldX = anchorCoordinates.x.get()
      const oldY = anchorCoordinates.y.get()
      const deltaX = newX - oldX
      const deltaY = newY - oldY

      const menu = ref.get()
      if (!menu) {
         return
      }
      menu.style.translate = `${deltaX}px ${deltaY}px`
   }

   observer.onConnected(trigger, (trigger) => {
      trigger.addEventListener(strategy, openContextMenu)
      return () => {
         trigger.removeEventListener(strategy, openContextMenu)
      }
   })

   return (
      <ContextMenuScope.Provider value={context}>
         {() =>
            If(isOpen, () => (
               <>
                  <div
                     class={styles.anchor}
                     data-anchor-name={anchorName}
                     ref={anchor}
                     style={anchorStyle}
                  />
                  <PopoverView isOpen anchor={anchor} positionArea='bottom right'>
                     {() => (
                        <menu {...rest} ref={ref} class={[styles.contextMenu, className]}>
                           {For(items, (item) => (
                              <li class={styles.item}>
                                 <ContextMenuItem {...item} />
                              </li>
                           ))}
                        </menu>
                     )}
                  </PopoverView>
               </>
            ))
         }
      </ContextMenuScope.Provider>
   )
}

function ContextMenuItem(props: ContextMenuItemProps) {
   return Switch.OnProperty(props, 'type', {
      [ItemTypes.Action]: ContextMenuAction,
      [ItemTypes.Check]: ContextMenuCheck,
      [ItemTypes.Separator]: ContextMenuSeparator,
      [ItemTypes.Radio]: ContextMenuRadio,
      [ItemTypes.SubMenu]: () => <></>
   })
}

function ContextMenuAction(props: ContextMenuActionItemProps) {
   const { onClick, label, icon, disabled } = props
   return (
      <button
         class={[styles.itemContent, styles.contextMenuActionBtn]}
         type='button'
         disabled={disabled}
         onClick={onClick}
      >
         <ContextMenuOptionalIcon icon={icon} />
         {typeof label === 'string' ? label : label()}
      </button>
   )
}

function ContextMenuOptionalIcon(props: ContextMenuOptionalIconProps) {
   const { icon } = props
   return If(icon, (icon) => (
      <div class={styles.iconContainer}>
         <DynamicIcon class={styles.icon} name={icon} />
      </div>
   ))
}

function ContextMenuCheck(props: ContextMenuCheckItemProps) {
   const { label, checked, onCheckedChange, icon, name } = props
   const { close } = useContextMenuContext()

   const handleOnChange = (event: Event) => {
      const { checked } = event.target as HTMLInputElement
      onCheckedChange?.(checked)
      close()
   }

   return (
      <label class={[styles.itemContent, styles.checkItem]}>
         {If(checked, () => (
            <Checkmark class={styles.check} />
         ))}
         <ContextMenuOptionalIcon icon={icon} />
         <input
            id={name}
            name={name}
            class={styles.checkItemInput}
            type='checkbox'
            checked={checked}
            onChange={handleOnChange}
         />

         {typeof label === 'string' ? label : label()}
      </label>
   )
}

function ContextMenuRadio(props: ContextMenuRadioItemProps) {
   const { label, value: valueProp, onSelect, icon, name } = props
   const { close } = useContextMenuContext()
   const value = useDerivedValue(valueProp)

   const handleOnChange = () => {
      onSelect?.(value.get())
      close()
   }

   return (
      <label class={[styles.itemContent, styles.checkItem]}>
         <ContextMenuOptionalIcon icon={icon} />
         <input
            id={name}
            name={name}
            class={styles.checkItemInput}
            type='radio'
            value={value}
            onChange={handleOnChange}
         />
         {typeof label === 'string' ? label : label()}
      </label>
   )
}

function ContextMenuSeparator() {
   return <hr class={styles.separator} />
}

function getFocusableElementInItem(parent: HTMLElement) {
   return parent.querySelector(':is(input, button):not(:disabled)') as HTMLElement | null
}
