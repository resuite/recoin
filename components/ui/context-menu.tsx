import { Button } from '@/components/ui/button'
import {
   type Alignment,
   PopoverView,
   type PositionArea,
   generateNewAnchorName
} from '@/components/views/popover-view'
import {
   polyfillTouchContextMenuEvent,
   removeTouchContextMenuEventPolyfill
} from '@/utilities/contextmenu-event-ios-polyfill'
import {
   clamp,
   defer,
   getFocusableElementInItem,
   useDocumentVisibility,
   usePointerPosition
} from '@/utilities/miscellaneous'
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
import { useDerivedValue } from 'retend-utils/hooks'
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
   pointerover: 'pointerleave',
   click: 'click',
   contextmenu: 'pointerdown'
} as const satisfies Record<ContextMenuStrategy, string>

const CONTEXT_SUBMENU_DELAY = 200
const FOCUSED_OR_IS_SEPARATOR_SELECTOR = `:has(>.${styles.separator}, :focus)`

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

export type ContextMenuStrategy = 'contextmenu' | 'pointerover' | 'click'

export type ContextMenuTriggerHandlers = Record<
   keyof typeof StrategyRelease,
   (event: Event) => void
>

type ContextMenuTriggerReleaseHandlers = Record<
   (typeof StrategyRelease)[keyof typeof StrategyRelease],
   (event: Event) => void
>

export type ContextMenuState = 'open' | 'closed'

type InteractionMode = 'pointer' | 'keyboard'

interface ContextMenuOptionalIconProps {
   icon?: IconName
}

type MenuProps = JSX.IntrinsicElements['menu']

/**
 * Configuration options for the ContextMenu component.
 * Extends standard HTML menu element properties.
 */
interface ContextMenuProps<T extends HTMLElement> extends MenuProps {
   /**
    * A reactive cell containing the element that triggers the context menu.
    * The context menu will attach event listeners to this element based on the strategy.
    */
   trigger: SourceCell<T | null>

   /**
    * If true, the context menu will use the trigger element as the anchor for positioning,
    * rather than the cursor position. This is useful for submenus or when you want the menu
    * to appear relative to the trigger element instead of where the user clicked.
    * @default false
    */
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
    * - 'pointerover': Opens on mouse enter, closes on mouse leave
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

   /**
    * A reactive cell to capture the HTMLElement of the context menu itself.
    * This can be used to directly interact with the menu's DOM element if needed.
    */
   ref?: SourceCell<HTMLMenuElement | null>

   /**
    * Additional CSS class(es) to apply to the popover container element.
    * This allows for custom styling of the popover that displays the context menu.
    */
   'popover:class'?: unknown
}

interface ContextMenuContext {
   isOpen: Cell<boolean>
   close: () => void
   trigger: SourceCell<HTMLElement | null>
   selected: SourceCell<number>
   subMenus: Set<Cell<HTMLMenuElement | null>>
   selectItem?: (event: Event) => void
   style?: JSX.ValueOrCell<JSX.StyleValue>
   class: unknown
}
const ContextMenuScope = createScope<ContextMenuContext>()

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
 *       <ContextMenu trigger={trigger} items={menuItems} />
 *     </div>
 *   )
 * }
 * ```
 */
export function ContextMenu<T extends HTMLElement>(props: ContextMenuProps<T>) {
   const {
      trigger,
      items: itemsProp,
      strategy = 'contextmenu',
      positionArea: positionAreaProp = 'bottom right',
      alignSelf: alignSelfProp,
      justifySelf: justifySelfProp,
      ref = Cell.source<HTMLMenuElement | null>(null),
      onStateChange,
      useTriggerAsAnchor,
      'popover:class': popoverClass,
      ...rest
   } = props
   const observer = useObserver()
   const cursorCoordinates = usePointerPosition()
   const documentIsVisible = useDocumentVisibility()
   const items = useDerivedValue(itemsProp)
   const positionArea = useDerivedValue(positionAreaProp)
   const alignSelf = useDerivedValue(alignSelfProp)
   const justifySelf = useDerivedValue(justifySelfProp)
   const anchor = Cell.source<HTMLElement | null>(null)
   const selected = Cell.source(-1)
   const menuShouldBeOpen = Cell.source(false)
   const anchorCoordinates = { x: Cell.source(0), y: Cell.source(0) }
   const releaseEvent = StrategyRelease[strategy]
   const anchorName = generateNewAnchorName()
   const mode = Cell.source<InteractionMode>('pointer')
   const subMenus = new Set<Cell<HTMLMenuElement | null>>()
   let waitingToShowSubmenuDelayId: ReturnType<typeof setTimeout> | null = null
   const count = Cell.derived(() => {
      return items.get().length
   })

   const isOpen = Cell.derived(() => {
      return menuShouldBeOpen.get() && documentIsVisible.get()
   })

   const anchorStyle = Cell.derived(() => {
      return {
         anchorName,
         top: `${anchorCoordinates.y.get()}px`,
         left: `${anchorCoordinates.x.get()}px`
      }
   })

   const close = () => {
      if (waitingToShowSubmenuDelayId) {
         clearTimeout(waitingToShowSubmenuDelayId)
         waitingToShowSubmenuDelayId = null
      }
      menuShouldBeOpen.set(false)
   }

   const openContextMenu = (event?: Event) => {
      if (event instanceof OpenSubmenuEvent) {
         // delay opening submenus for better ux
         waitingToShowSubmenuDelayId = setTimeout(openContextMenu, CONTEXT_SUBMENU_DELAY)
         return
      }
      const x1 = cursorCoordinates.x.get()
      const y1 = cursorCoordinates.y.get()
      setAnchorCoordinates(x1, y1)
      menuShouldBeOpen.set(true)
   }

   const handleKeybindings = createKeybindingHandler(mode, ref, subMenus, selected, items, close)
   const handlers = createHandlers(ref, isOpen, openContextMenu, close)
   const { triggerHandlers, releaseHandlers } = handlers

   const triggerHandler = triggerHandlers[strategy]
   const releaseHandler = releaseHandlers[releaseEvent]

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
   const ctx: ContextMenuContext = {
      isOpen,
      close,
      trigger: trigger as SourceCell<HTMLElement | null>,
      subMenus,
      selected,
      selectItem,
      class: rest.class,
      style: rest.style
   }

   observer.onConnected(trigger, (trigger) => {
      trigger.addEventListener(strategy, triggerHandler)
      trigger.addEventListener(OpenSubmenuEvent.eventName, openContextMenu)
      trigger.addEventListener(CloseSubmenuEvent.eventName, close)

      // Safari again. The contextmenu event never fires on iOS, even though:
      // - it is supported on mac versions
      // - it is defined in Element.oncontextmenu
      // Some old bug they just never got around to, surely.
      const isIOS = 'GestureEvent' in window
      if (isIOS && strategy === 'contextmenu') {
         polyfillTouchContextMenuEvent(trigger)
      }

      return () => {
         trigger.removeEventListener(strategy, triggerHandler)
         trigger.removeEventListener(OpenSubmenuEvent.eventName, openContextMenu)
         trigger.removeEventListener(CloseSubmenuEvent.eventName, close)
         removeTouchContextMenuEventPolyfill(trigger)
      }
   })

   selected.listen((idx) => {
      const menu = ref.peek()
      const itemList = items.peek()
      if (!menu) {
         return
      }

      for (let i = 0; menu.children[i]; i++) {
         const currentItem = itemList[i]
         const isSelected = i === idx
         const listElement = menu.children[i] as HTMLElement

         // Handle submenu visibility:
         // If the current item is a submenu, dispatch an 'open' event if it's the newly
         // selected one, or a 'close' event for any other submenu.
         if (currentItem.type === ItemTypes.SubMenu) {
            const submenuEvent = isSelected ? new OpenSubmenuEvent() : new CloseSubmenuEvent()
            listElement.dispatchEvent(submenuEvent)
         }

         if (
            isSelected &&
            mode.get() === 'keyboard' &&
            !listElement.matches(FOCUSED_OR_IS_SEPARATOR_SELECTOR)
         ) {
            getFocusableElementInItem(listElement)?.focus()
         }
      }
   })

   isOpen.listen((contextMenuIsOpen) => {
      onStateChange?.(contextMenuIsOpen ? 'open' : 'closed')
      const eventListenerTarget = strategy === 'pointerover' ? trigger.peek() : document

      if (contextMenuIsOpen) {
         defer(() => {
            eventListenerTarget?.addEventListener(releaseEvent, releaseHandler)
            document.addEventListener('keydown', handleKeybindings)
            document.addEventListener('resize', close)
         })
         return
      }

      selected.set(-1)
      eventListenerTarget?.removeEventListener(releaseEvent, releaseHandler)
      document.removeEventListener('keydown', handleKeybindings)
      document.removeEventListener('resize', close)
   })

   return If(isOpen, () => (
      <ContextMenuScope.Provider value={ctx}>
         {() => (
            // This needs to be a teleport in case of recursive submenus.
            // the anchor needs to be position:fixed to anchor with the current cursor position,
            // and the behaviour of nested fixed elements in browsers is...questionable.
            <Teleport
               to='body'
               class={styles.anchor}
               data-anchor-name={anchorName}
               ref={anchor}
               style={anchorStyle}
            >
               <PopoverView
                  class={popoverClass}
                  isOpen
                  anchor={(useTriggerAsAnchor ? trigger : anchor) as SourceCell<HTMLElement | null>}
                  positionArea={positionArea}
                  alignSelf={alignSelf}
                  justifySelf={justifySelf}
               >
                  {() => (
                     <menu
                        {...rest}
                        ref={ref}
                        class={[styles.contextMenu, rest.class]}
                        onPointerOut--self={unselectItem}
                        style={{ '--context-menu-item-count': count }}
                     >
                        {For(items, ContextMenuListItem)}
                     </menu>
                  )}
               </PopoverView>
            </Teleport>
         )}
      </ContextMenuScope.Provider>
   ))
}

function ContextMenuListItem(item: ContextMenuItemProps, idx: Cell<number>) {
   const { selected, selectItem } = useContextMenuContext()

   return (
      <li
         class={styles.item}
         style={{ '--context-menu-item-index': idx }}
         data-index={idx}
         data-selected={Cell.derived(() => idx.get() === selected.get())}
         onMouseEnter--self={selectItem}
         onFocusIn={selectItem}
      >
         <ContextMenuItem {...item} />
      </li>
   )
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
      <Button
         class={[styles.itemContent, styles.contextMenuActionBtn]}
         type='button'
         disabled={disabled}
         onClick={handleClick}
      >
         <ContextMenuOptionalIcon icon={icon} />
         {typeof label === 'string' ? label : label()}
      </Button>
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
   const contextMenu = Cell.source<HTMLMenuElement | null>(null)
   const button = Cell.source<HTMLButtonElement | null>(null)
   const { subMenus, style, class: className } = useContextMenuContext()

   observer.onConnected(button, (button) => {
      trigger.set(button.parentElement as HTMLLIElement)
   })

   contextMenu.listen(() => {
      observer.onConnected(contextMenu, () => {
         subMenus.add(contextMenu)
         return () => {
            subMenus.delete(contextMenu)
         }
      })
   })

   return (
      <>
         <Button
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
         </Button>
         <ContextMenu
            ref={contextMenu}
            class={[className, styles.submenu]}
            style={style}
            trigger={trigger}
            items={items}
            useTriggerAsAnchor
            positionArea='center right'
            alignSelf='start'
         />
      </>
   )
}

function isNotFocusableItem(item: ContextMenuItemProps) {
   return item && (item.type === ItemTypes.Separator || item.disabled)
}

function createHandlers(
   ref: SourceCell<HTMLMenuElement | null>,
   isOpen: Cell<boolean>,
   openContextMenu: () => void,
   close: () => void
) {
   const triggerHandlers: ContextMenuTriggerHandlers = {
      contextmenu(event) {
         event.preventDefault()
         openContextMenu()
      },
      click: openContextMenu,
      pointerover() {
         if (isOpen.get()) {
            return
         }
         openContextMenu()
      }
   }

   const releaseHandlers: ContextMenuTriggerReleaseHandlers = {
      pointerdown(event) {
         const target = event.target as Node
         const menu = ref.get()
         if (!menu?.contains(target)) {
            close()
         }
      },
      click(event) {
         const target = event.target as Node
         const menu = ref.get()
         if (!menu?.contains(target)) {
            close()
         }
      },
      pointerleave(event) {
         const nextElement = (event as PointerEvent).relatedTarget as Node
         const menu = ref.peek()
         if (!menu?.contains(nextElement)) {
            close()
         }
      }
   }

   return { triggerHandlers, releaseHandlers }
}

function createKeybindingHandler(
   mode: SourceCell<InteractionMode>,
   ref: SourceCell<HTMLMenuElement | null>,
   subMenus: Set<Cell<HTMLMenuElement | null>>,
   selected: SourceCell<number>,
   items: Cell<ContextMenuItemProps[]>,
   close: () => void
) {
   const itemCount = Cell.derived(() => {
      return items.get().length
   })

   return (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
         return
      }
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
      if (subMenus.size > 0 && !menu.contains(focusedElement)) {
         return
      }
      let nextSelection: number | undefined
      const itemList = items.peek()
      const currentSelectedIndex = selected.get()
      const maximumItemIndex = itemCount.get() - 1

      if (currentSelectedIndex === -1 && (!focusedElement || !menu.contains(focusedElement))) {
         selected.set(code === 'ArrowUp' ? maximumItemIndex : 0)
         return
      }

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
            break
         case 'ArrowLeft':
            close()
      }

      if (nextSelection !== undefined) {
         selected.set(clamp(nextSelection, 0, maximumItemIndex))
      }
   }
}

function useContextMenuContext() {
   return useScopeContext(ContextMenuScope)
}

export class OpenSubmenuEvent extends Event {
   static eventName = '__open-sub-menu'
   constructor() {
      super(OpenSubmenuEvent.eventName, {
         bubbles: false,
         composed: false,
         cancelable: false
      })
   }
}

export class CloseSubmenuEvent extends Event {
   static eventName = '_close-sub-menu'
   constructor() {
      super(CloseSubmenuEvent.eventName, {
         bubbles: false,
         composed: false,
         cancelable: false
      })
   }
}
