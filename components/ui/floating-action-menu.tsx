import { Cell, For } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import { Icon, type IconName } from '@/components/icons'
import Add from '@/components/icons/svg/add'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { PopoverView } from '@/components/views/popover-view'
import { useSidebarContext } from '@/components/views/sidebar-provider-view'
import { VibrationPatterns } from '@/constants/vibration'
import { ThemeAwareTeleport } from '@/scopes/theme'
import { animationsSettled } from '@/utilities/animations'
import { createPointerOrClickHandler, vibrate } from '@/utilities/miscellaneous'
import styles from './floating-action-menu.module.css'

export interface FloatingMenuItem {
   label: string
   icon: IconName
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
   const { toggleSidebarEnabled } = useSidebarContext()
   const isOpen = useDerivedValue(isOpenProp)
   const trigger = Cell.source<HTMLButtonElement | null>(null)
   const containerRef = Cell.source<HTMLElement | null>(null)
   const contentIsOpen = Cell.source(isOpen.get())

   const toggleState = createPointerOrClickHandler(() => {
      vibrate(VibrationPatterns.ButtonPress)
      onStateChange?.(!isOpen.get())
   })

   isOpen.runAndListen(async (menuIsOpen) => {
      toggleSidebarEnabled(!menuIsOpen)

      const isClosing = !menuIsOpen
      if (isClosing) {
         containerRef.get()?.classList.add(styles.closing)
         await animationsSettled(containerRef, { subtree: true })
         containerRef.get()?.classList.remove(styles.closing)
      }
      contentIsOpen.set(menuIsOpen)
   })

   return (
      <ThemeAwareTeleport
         to={teleportTarget}
         ref={containerRef}
         class={[styles.teleport, { [styles.open]: contentIsOpen }]}
         onClick--self={toggleState}
      >
         <FloatingActionButton
            ref={trigger}
            inline='right'
            block='bottom'
            onClick={toggleState}
            onPointerDown={toggleState}
         >
            <FloatingIcon />
         </FloatingActionButton>
         <PopoverView
            isOpen={contentIsOpen}
            anchor={trigger}
            class={styles.popover}
            justifySelf='end'
         >
            {() => (
               <menu class={styles.menu} style={{ '--fa-item-count': count }}>
                  {For(items, (item, index) => (
                     <button
                        type='button'
                        class={styles.floatingListItem}
                        style={{ '--fa-index': index }}
                        onClick={item.onClick}
                     >
                        <div>
                           <Icon name={item.icon} />
                        </div>
                        {item.label}
                     </button>
                  ))}
               </menu>
            )}
         </PopoverView>
         {children}
      </ThemeAwareTeleport>
   )
}
