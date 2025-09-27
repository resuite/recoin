import Caret from '@/components/icons/svg/caret'
import Checkmark from '@/components/icons/svg/checkmark'
import {
   ContextMenu,
   type ContextMenuItemProps,
   type ContextMenuState,
   ItemTypes
} from '@/components/ui/context-menu'
import { SEARCH_BUFFER_TIMEOUT_MS } from '@/constants'
import { getFocusableElementInItem } from '@/utilities/miscellaneous'
import { Cell, For, If, type SourceCell, useObserver, useSetupEffect } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './dropdown.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface DropdownOption<T extends PropertyKey> {
   label: string
   value: T
}

interface DropdownProps<T extends PropertyKey> extends DivProps {
   selectedOption?: SourceCell<DropdownOption<T>>
   options: JSX.ValueOrCell<DropdownOption<T>[]>
   'list:class'?: unknown
}

export function Dropdown<T extends PropertyKey>(props: DropdownProps<T>) {
   const {
      options: optionsProp,
      selectedOption: outerSelected,
      'list:class': listClass,
      ...rest
   } = props

   const observer = useObserver()
   const options = useDerivedValue(optionsProp)
   const dropdownIsOpen = Cell.source(false)
   const select = Cell.source<HTMLSelectElement | null>(null)
   const contextMenu = Cell.source<HTMLMenuElement | null>(null)
   const selectedOption = Cell.source(outerSelected ? outerSelected.get() : options.get().at(0))
   const initialSelect = selectedOption.get()
   let searchBuffer = ''
   let bufferTimeout: NodeJS.Timeout | null = null
   const caretDirection = Cell.derived(() => {
      return dropdownIsOpen.get() ? 'top' : 'bottom'
   })

   const renderDropdownOption = (option: DropdownOption<T>): ContextMenuItemProps => {
      const isSelected = Cell.derived(() => {
         const selected = selectedOption.get()
         return selected && option.value === selected.value
      })

      const Label = () => {
         const containerRef = Cell.source<HTMLElement | null>(null)
         observer.onConnected(containerRef, (container) => {
            if (isSelected.get()) {
               const listParent = container.closest('menu > *') as HTMLElement
               listParent?.scrollIntoView({ block: 'center', behavior: 'instant' })
            }
         })

         return (
            <div ref={containerRef} class={styles.option}>
               {If(isSelected, () => {
                  return <Checkmark class={styles.checkmark} />
               })}
               <span class={styles.label}>{option.label}</span>
            </div>
         )
      }

      const onClick = () => {
         selectedOption.set(option)
      }

      return {
         type: ItemTypes.Action,
         label: Label,
         onClick
      }
   }

   const items = Cell.derived<ContextMenuItemProps[]>(() => {
      return options.get().map(renderDropdownOption)
   })

   const resetBufferTimeout = () => {
      if (bufferTimeout) {
         clearTimeout(bufferTimeout)
      }
      bufferTimeout = setTimeout(() => {
         searchBuffer = ''
      }, SEARCH_BUFFER_TIMEOUT_MS)
   }

   const handleStateChange = (state: ContextMenuState) => {
      dropdownIsOpen.set(state === 'open')
   }

   const handleKeydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
         return
      }
      resetBufferTimeout()
      const searchQuery = event.key.toLowerCase()
      searchBuffer += searchQuery
      const contextMenuElement = contextMenu.get()
      const matchingOptionIdx = options.get().findIndex((option) => {
         return option.label.toLowerCase().startsWith(searchBuffer)
      })
      if (matchingOptionIdx === -1 || contextMenuElement === null) {
         return
      }

      const matchingOptionElement = contextMenuElement.children[matchingOptionIdx] as HTMLLIElement
      getFocusableElementInItem(matchingOptionElement)?.focus()
   }

   selectedOption.listen((option) => {
      if (!option) {
         return
      }
      outerSelected?.set(option)
      const selectElement = select.peek()
      if (!selectElement) {
         return
      }
      selectElement.value = String(option.value)
   })

   dropdownIsOpen.listen((isOpen) => {
      if (isOpen) {
         document.addEventListener('keydown', handleKeydown)
      } else {
         document.removeEventListener('keydown', handleKeydown)
      }
   })

   useSetupEffect(() => {
      return () => {
         document.removeEventListener('keydown', handleKeydown)
      }
   })

   return (
      <div {...rest} class={[styles.container, rest.class]}>
         <select ref={select} class={styles.select} onMouseDown--prevent={() => {}}>
            {For(options, (option) => {
               return (
                  <option
                     selected={option.value === initialSelect?.value}
                     value={String(option.value)}
                  >
                     {option.label}
                  </option>
               )
            })}
         </select>
         <Caret direction={caretDirection} class={styles.caret} />

         <ContextMenu
            useTriggerAsAnchor
            ref={contextMenu}
            popover:class={styles.popover}
            class={[styles.options, listClass]}
            trigger={select as SourceCell<HTMLElement | null>}
            positionArea='bottom center'
            items={items}
            strategy='click'
            onStateChange={handleStateChange}
         />
      </div>
   )
}
