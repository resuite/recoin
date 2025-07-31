import {
   type Alignment,
   PopoverView,
   type PositionArea,
   generateNewAnchorName
} from '@/components/views/popover-view'
import { clamp, defer, useDocumentVisibility } from '@/utilities/miscellaneous'
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
import { Teleport } from 'retend/teleport'
import { DynamicIcon, type IconName } from '../icons'
import Checkmark from '../icons/svg/checkmark'
import styles from './context-menu.module.css'

export const ItemTypes = {
   Check: 'check',
   Action: 'action',
   Separator: 'separator',
   SubMenu: 'submenu'
} as const

export const StrategyRelease = {
   mouseover: 'mouseleave',
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

export interface ContextMenuSubMenuProps extends ContextMenuItemBase {
   type: typeof ItemTypes.SubMenu
   items: JSX.ValueOrCell<ContextMenuItemProps[]>
}

export type ContextMenuItemProps =
   | ContextMenuCheckItemProps
   | ContextMenuActionItemProps
   | ContextMenuSeparatorProps
   | ContextMenuSubMenuProps

export type ContextMenuStrategy = 'contextmenu' | 'mouseover' | 'pointerdown' | 'click'

export type ContextMenuTriggerHandlers = Record<
   keyof typeof StrategyRelease,
   (event: Event) => void
>

type ContextMenuTriggerReleaseHandlers = Record<
   (typeof StrategyRelease)[keyof typeof StrategyRelease],
   (event: Event) => void
>

type ContextMenuState = 'open' | 'closed'

type InteractionMode = 'pointer' | 'keyboard'

interface ContextMenuOptionalIconProps {
   icon?: IconName
}

type MenuProps = JSX.IntrinsicElements['menu']

/**
 * Configuration options for the ContextMenu component.
 * Extends standard HTML menu element properties.
 */
interface ContextMenuProps extends MenuProps {
   /**
    * A reactive cell containing the element that triggers the context menu.
    * The context menu will attach event listeners to this element based on the strategy.
    */
   trigger: SourceCell<HTMLElement | null>

   useTriggerAsAnchor?: boolean

   /**
    * Array of menu items to display in the context menu.
    * Can be a static array or a reactive cell that updates the menu items dynamically.
    * Supports action items, checkboxes, separators, and submenus.
    */
   items: JSX.ValueOrCell<ContextMenuItemProps[]>

   /**
    * Determines how the context menu is opened and closed.
    * - 'contextmenu': Opens on right-click, closes on click elsewhere
    * - 'mouseover': Opens on mouse enter, closes on mouse leave
    * - 'pointerdown': Opens on pointer down, closes on pointer up
    * - 'click': Opens on click, closes on click elsewhere
    * @default 'contextmenu'
    */
   strategy?: ContextMenuStrategy

   /**
    * Specifies the preferred area around the anchor (trigger or cursor) where the context menu should appear.
    * This dictates the primary quadrant or direction for positioning.
    * Examples: 'bottom right', 'top left', 'center'.
    * @default 'bottom right'
    */
   positionArea?: JSX.ValueOrCell<PositionArea>
   /**
    * Controls the alignment of the context menu along the main axis determined by `positionArea`.
    * For instance, if `positionArea` is 'bottom right', `alignSelf` manages the vertical alignment
    * (top, center, or bottom edge of the menu relative to the anchor).
    * Possible values: 'start' (top/left), 'center', 'end' (bottom/right).
    * @default 'end'
    */
   alignSelf?: JSX.ValueOrCell<Alignment>
   /**
    * Controls the alignment of the context menu along the cross axis determined by `positionArea`.
    * For instance, if `positionArea` is 'bottom right', `justifySelf` manages the horizontal alignment
    * (left, center, or right edge of the menu relative to the anchor).
    * Possible values: 'start' (top/left), 'center', 'end' (bottom/right).
    */
   justifySelf?: JSX.ValueOrCell<Alignment>

   /**
    * Callback function invoked when the context menu's open state changes.
    * @param newState The new state of the context menu, either 'open' or 'closed'.
    */
   onStateChange?: (newState: ContextMenuState) => void
}

interface ContextMenuContext {
   isOpen: Cell<boolean>
   close: () => void
   trigger: SourceCell<HTMLElement | null>
   subMenuIsOpen: SourceCell<boolean>
}
const ContextMenuScope = createScope<ContextMenuContext>()

/**
 * Hook to access the context menu's internal state and controls.
 *
 * Provides access to the context menu's open state, close function,
 * and trigger element reference. It can only be used within components that are
 * rendered inside a ContextMenu component.
 *
 * @throws {Error} If called outside of a ContextMenu component
 * @example
 * ```tsx
 * function CustomMenuItem() {
 *   const { isOpen, close, trigger } = useContextMenuContext()
 *
 *   const handleCustomAction = () => {
 *     console.log('Custom action performed')
 *     close()
 *   }
 *
 *   return (
 *     <button onClick={handleCustomAction}>
 *       Custom Action
 *     </button>
 *   )
 * }
 * ```
 */
export function useContextMenuContext() {
   return useScopeContext(ContextMenuScope)
}

export function tryUseContextMenuContext() {
   try {
      return useContextMenuContext()
   } catch {
      return null
   }
}

/**
 * A flexible context menu component that can be triggered by various user interactions.
 *
 * The ContextMenu component creates a popover-style menu that appears at the cursor position
 * when triggered. It supports keyboard navigation, multiple item types (actions, checkboxes,
 * separators, submenus), and various trigger strategies.
 *
 * @param props - The context menu configuration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trigger = Cell.source<HTMLElement | null>(null)
 *   const isVisible = Cell.source(true)
 *
 *   const handleCopy = () => {
 *     navigator.clipboard.writeText('Hello world')
 *   }
 *
 *   const handleDelete = () => {
 *     console.log('Item deleted')
 *   }
 *
 *   const setVisible = (visible: boolean) => {
 *     isVisible.set(visible)
 *   }
 *
 *   const menuItems = [
 *     { type: 'action', label: 'Copy', icon: 'copy', onClick: handleCopy },
 *     { type: 'action', label: 'Delete', icon: 'trash', onClick: handleDelete },
 *     { type: 'separator' },
 *     { type: 'check', name: 'visibility', label: 'Show Item', checked: isVisible, onCheckedChange: setVisible }
 *   ]
 *
 *   return (
 *     <div>
 *       <div ref={trigger}>Right-click me!</div>
 *       <ContextMenu
 *         trigger={trigger}
 *         items={menuItems}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function ContextMenu(props: ContextMenuProps) {
   const {
      trigger,
      items: itemsProp,
      strategy = 'contextmenu',
      class: className,
      onStateChange,
      useTriggerAsAnchor,
      positionArea: positionAreaProp = 'bottom right',
      alignSelf: alignSelfProp,
      justifySelf: justifySelfProp,
      ...rest
   } = props
   const observer = useObserver()
   const cursorCoordinates = useCursorPosition()
   const documentIsVisible = useDocumentVisibility()
   const items = useDerivedValue(itemsProp)
   const positionArea = useDerivedValue(positionAreaProp)
   const alignSelf = useDerivedValue(alignSelfProp)
   const justifySelf = useDerivedValue(justifySelfProp)
   const ref = Cell.source<HTMLElement | null>(null)
   const anchor = Cell.source<HTMLElement | null>(null)
   const selected = Cell.source(-1)
   const subMenuIsOpen = Cell.source(false)
   const menuShouldBeOpen = Cell.source(false)
   const anchorCoordinates = { x: Cell.source(0), y: Cell.source(0) }
   const releaseEvent = StrategyRelease[strategy]
   const anchorName = generateNewAnchorName()
   const mode = Cell.source<InteractionMode>('pointer')
   const _parentContextMenuCtx = tryUseContextMenuContext()

   const isOpen = Cell.derived(() => {
      return menuShouldBeOpen.get() && documentIsVisible.get()
   })

   const itemCount = Cell.derived(() => {
      return items.get().length
   })

   const anchorStyle = Cell.derived(() => {
      return {
         anchorName,
         top: `${anchorCoordinates.y.get()}px`,
         left: `${anchorCoordinates.x.get()}px`
      }
   })

   const close = () => {
      menuShouldBeOpen.set(false)
   }

   const handleKeybindings = (event: KeyboardEvent) => {
      mode.set('keyboard')
      const { code } = event
      if (code === 'Tab') {
         return
      }
      if (code === 'Escape') {
         close()
         return
      }
      const menu = ref.peek()
      if (!menu) {
         return
      }

      const focusedElement = document.activeElement
      if (subMenuIsOpen.get()) {
         // Submenus should handle keyboard focus when open.
         // Direct DOM traversal for nested menus (`ctxMenu.querySelector(.ctxMenu)`) is not viable
         // due to `Teleport` flattening the DOM to address `position:fixed` nesting.
         return
      }

      const currentSelectedIndex = selected.get()
      const maximumItemIndex = itemCount.get() - 1
      if (currentSelectedIndex === -1 && (!focusedElement || !menu.contains(focusedElement))) {
         selected.set(code === 'ArrowUp' ? maximumItemIndex : 0)
         return
      }

      let nextSelection: number | undefined
      const itemList = items.get()

      switch (code) {
         case 'ArrowDown':
            nextSelection = currentSelectedIndex + 1
            while (isNotFocusableItem(itemList[nextSelection])) {
               nextSelection = nextSelection + 1
            }
            break
         case 'ArrowUp':
            nextSelection = currentSelectedIndex - 1
            while (isNotFocusableItem(itemList[nextSelection])) {
               nextSelection = nextSelection - 1
            }
      }

      if (nextSelection !== undefined) {
         selected.set(clamp(nextSelection, 0, maximumItemIndex))
      }
   }

   const openContextMenu = () => {
      const menu = ref.get()
      const isAlreadyOpen = isOpen.get()

      const x1 = cursorCoordinates.x.get()
      const y1 = cursorCoordinates.y.get()

      if (!isAlreadyOpen) {
         setAnchorCoordinates(x1, y1)
         menuShouldBeOpen.set(true)
         return
      }
      if (!menu) {
         return
      }

      // If the menu is already open, we can just smoothly animate it
      // to its new position. (using translations, because compositing.)

      const { width, height } = menu.getBoundingClientRect()
      const _x1 = Math.min(innerWidth - width, x1)
      const _y1 = Math.min(innerHeight - height, y1)
      const x0 = anchorCoordinates.x.get()
      const y0 = anchorCoordinates.y.get()

      const dx = _x1 - x0
      const dy = _y1 - y0
      menu.style.translate = `${dx}px ${dy}px`
   }

   const triggerHandlers: ContextMenuTriggerHandlers = {
      contextmenu(event) {
         event.preventDefault()
         openContextMenu()
      },
      click: openContextMenu,
      mouseover() {
         if (!isOpen.get()) {
            openContextMenu()
         }
      },
      pointerdown: openContextMenu
   }

   const triggerReleaseHandlers: ContextMenuTriggerReleaseHandlers = {
      click(event) {
         const target = event.target as Node
         const menu = ref.get()
         if (menu?.contains(target)) {
            return
         }
         close()
      },
      mouseleave(event) {
         const _event = event as MouseEvent
         const nextElement = _event.relatedTarget as Node
         const menu = ref.get()
         if (menu?.contains(nextElement)) {
            return
         }
         close()
      },
      pointerup: close
   }

   const selectItem = (event: Event) => {
      mode.set('pointer')
      const { dataset } = event.currentTarget as HTMLLIElement
      selected.set(Number(dataset.index))
   }

   const unselectItem = () => {
      selected.set(-1)
   }

   const setAnchorCoordinates = (x: number, y: number) => {
      Cell.batch(() => {
         anchorCoordinates.x.set(x)
         anchorCoordinates.y.set(y)
      })
   }

   const triggerHandler = triggerHandlers[strategy]
   const triggerReleaseHandler = triggerReleaseHandlers[releaseEvent]

   observer.onConnected(trigger, (trigger) => {
      trigger.addEventListener(strategy, triggerHandler)
      return () => {
         trigger.removeEventListener(strategy, triggerHandler)
      }
   })

   selected.listen((idx) => {
      if (idx === -1) {
         return
      }
      const menu = ref.get()
      if (!menu) {
         return
      }
      const selectedElement = menu.children[idx] as HTMLElement
      if (selectedElement.matches(`:has(>.${styles.separator}, :focus)`)) {
         return
      }
      if (mode.get() === 'keyboard') {
         getFocusableElementInItem(selectedElement)?.focus()
      }
   })

   isOpen.listen((contextMenuIsOpen) => {
      onStateChange?.(contextMenuIsOpen ? 'open' : 'closed')
      const eventListenerTarget = strategy === 'mouseover' ? trigger.peek() : window

      if (contextMenuIsOpen) {
         defer(() => {
            eventListenerTarget?.addEventListener(releaseEvent, triggerReleaseHandler)
            window.addEventListener('keydown', handleKeybindings)
            window.addEventListener('resize', close)
         })
         return
      }

      selected.set(-1)
      eventListenerTarget?.removeEventListener(releaseEvent, triggerReleaseHandler)
      window.removeEventListener('keydown', handleKeybindings)
      window.removeEventListener('resize', close)
   })

   return If(isOpen, () => (
      <ContextMenuScope.Provider value={{ isOpen, close, trigger, subMenuIsOpen }}>
         {() => (
            // This needs to be a teleport in case of recursive submenus.
            // the anchor needs to be position:fixed to anchor with the current cursor position,
            // but the behaviour of fixed elements in fixed elements is questionable.
            <Teleport
               to='body'
               class={styles.anchor}
               data-anchor-name={anchorName}
               ref={anchor}
               style={anchorStyle}
            >
               <PopoverView
                  isOpen
                  anchor={useTriggerAsAnchor ? trigger : anchor}
                  positionArea={positionArea}
                  alignSelf={alignSelf}
                  justifySelf={justifySelf}
               >
                  {() => (
                     <menu
                        {...rest}
                        ref={ref}
                        class={[styles.contextMenu, className]}
                        onPointerOut--self={unselectItem}
                     >
                        {For(items, (item, idx) => (
                           <li
                              class={styles.item}
                              data-index={idx}
                              data-selected={Cell.derived(() => idx.get() === selected.get())}
                              onPointerEnter--self={selectItem}
                              onFocusIn={selectItem}
                           >
                              <ContextMenuItem {...item} />
                           </li>
                        ))}
                     </menu>
                  )}
               </PopoverView>
            </Teleport>
         )}
      </ContextMenuScope.Provider>
   ))
}

function ContextMenuItem(props: ContextMenuItemProps) {
   return Switch.OnProperty(props, 'type', {
      [ItemTypes.Action]: ContextMenuAction,
      [ItemTypes.Check]: ContextMenuCheck,
      [ItemTypes.Separator]: ContextMenuSeparator,
      [ItemTypes.SubMenu]: ContextMenuSubMenu
   })
}

function ContextMenuAction(props: ContextMenuActionItemProps) {
   const { onClick, label, icon, disabled } = props
   const { close } = useContextMenuContext()

   const handleClick = (event: MouseEvent) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
         close()
      }
   }

   return (
      <button
         class={[styles.itemContent, styles.contextMenuActionBtn]}
         type='button'
         disabled={disabled}
         onClick={handleClick}
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

function ContextMenuSeparator() {
   return <hr class={styles.separator} />
}

function ContextMenuSubMenu(props: ContextMenuSubMenuProps) {
   const observer = useObserver()
   const trigger = Cell.source<HTMLElement | null>(null)
   const { items, label, disabled, type: _type, icon } = props
   const button = Cell.source<HTMLButtonElement | null>(null)

   observer.onConnected(button, (button) => {
      trigger.set(button.parentElement as HTMLLIElement)
   })

   return (
      <>
         <button
            ref={button}
            class={[styles.itemContent, styles.contextMenuActionBtn]}
            type='button'
            disabled={disabled}
         >
            <ContextMenuOptionalIcon icon={icon} />
            {typeof label === 'string' ? label : label()}
            <div class={styles.caretContainer}>
               <DynamicIcon name='caret' class={styles.caret} />
            </div>
         </button>
         <ContextMenu
            class={styles.submenu}
            trigger={trigger}
            items={items}
            useTriggerAsAnchor
            positionArea='center right'
            alignSelf='start'
            strategy='mouseover'
         />
      </>
   )
}

function getFocusableElementInItem(parent: HTMLElement) {
   return parent.querySelector(':is(input, button):not(:disabled)') as HTMLElement | null
}

function isNotFocusableItem(item: ContextMenuItemProps) {
   return item && (item.type === ItemTypes.Separator || item.disabled)
}
