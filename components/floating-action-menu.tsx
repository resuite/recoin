import { Cell, For } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import { FloatingActionButton } from '@/components/floating-action-button'
import type { IconProps } from '@/components/icons'
import Add from '@/components/icons/svg/add'
import { Overlay } from '@/components/overlay'
import { PopoverView } from '@/components/popover-view'
import { VibrationPatterns } from '@/constants/vibration'
import { ThemeAwareTeleport } from '@/scopes/theme'
import { animationsSettled } from '@/utilities/animations'
import { createPointerOrClickHandler, vibrate } from '@/utilities/miscellaneous'
import styles from './floating-action-menu.module.css'

export interface FloatingMenuItem {
   label: string
   icon: (props: IconProps) => JSX.Template
   onClick?: () => void
}

interface FloatingMenuProps {
   isOpen: JSX.ValueOrCell<boolean>
   icon?: () => JSX.Template
   items: Array<FloatingMenuItem>
   teleportTarget?: string
   children?: JSX.Children
   onStateChange?: (isOpen: boolean) => void
}

export function FloatingMenu(props: FloatingMenuProps) {
   const {
      items: itemProp,
      isOpen: isOpenProp,
      teleportTarget = 'body',
      children,
      icon: FloatingIcon = () => (
         <div class={styles.icon}>
            <Add />
         </div>
      ),
      onStateChange
   } = props
   const items = useDerivedValue(itemProp)
   const count = Cell.derived(() => {
      return items.get().length
   })
   const isOpen = useDerivedValue(isOpenProp)
   const triggerRef = Cell.source<HTMLButtonElement | null>(null)
   const containerRef = Cell.source<HTMLElement | null>(null)
   const popoverRef = Cell.source<HTMLDivElement | null>(null)
   const contentIsOpen = Cell.source(isOpen.get())
   const itemsEnabled = Cell.source(false)
   const pointerEvents = Cell.derived(() => {
      return itemsEnabled.get() ? 'auto' : 'none'
   })

   const toggleState = createPointerOrClickHandler(() => {
      vibrate(VibrationPatterns.ButtonPress)
      onStateChange?.(!isOpen.get())
   })

   const PopoverContent = () => (
      <menu class={[styles.menu]} style={{ '--fa-item-count': count }}>
         {For(items, (item, index) => {
            const ref = Cell.source<HTMLButtonElement | null>(null)

            return (
               <button
                  ref={ref}
                  type='button'
                  class={styles.floatingListItem}
                  style={{ '--fa-index': index, pointerEvents }}
                  onClick={item.onClick}
               >
                  <item.icon class={styles.itemIcon} />
                  {item.label}
               </button>
            )
         })}
      </menu>
   )

   let timeout: NodeJS.Timeout | undefined
   isOpen.listen((isOpen) => {
      itemsEnabled.set(false)
      if (isOpen) {
         if (timeout) {
            clearTimeout(timeout)
         }
         timeout = setTimeout(() => {
            itemsEnabled.set(true)
         }, 300)
      }
   })

   isOpen.listen(
      async (open) => {
         if (!open) {
            await animationsSettled(containerRef, { subtree: true })
            if (isOpen.get()) {
               return
            }
         }

         contentIsOpen.set(open)
      },
      { priority: -1 }
   )

   return (
      <ThemeAwareTeleport to={teleportTarget} ref={containerRef} class={styles.teleport}>
         <Overlay class={styles.overlay} isDimmed={isOpen} onClick={toggleState} />
         <FloatingActionButton
            ref={triggerRef}
            inline='right'
            block='bottom'
            class={[styles.button, 'ios:bg-glass']}
            onClick={toggleState}
            onPointerDown={toggleState}
         >
            <FloatingIcon />
         </FloatingActionButton>
         <PopoverView
            ref={popoverRef}
            isOpen={contentIsOpen}
            anchor={triggerRef}
            class={[styles.popover, { [styles.open]: isOpen }, 'ios:bg-glass']}
            justifySelf='end'
         >
            {PopoverContent}
         </PopoverView>
         {children}
      </ThemeAwareTeleport>
   )
}
