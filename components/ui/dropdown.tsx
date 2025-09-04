import { getFocusableElementInItem } from '@/utilities/miscellaneous'
import { Cell, For, If, type SourceCell, useObserver, useSetupEffect } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import Caret from '../icons/svg/caret'
import Checkmark from '../icons/svg/checkmark'
import {
   ContextMenu,
   type ContextMenuItemProps,
   type ContextMenuState,
   ItemTypes
} from './context-menu'
import styles from './dropdown.module.css'

const SEARCH_BUFFER_TIMEOUT_MS = 400

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
      selectedOption: outerSelectedOption,
      'list:class': listClass,
      ...rest
   } = props

   const observer = useObserver()
   const options = useDerivedValue(optionsProp)
   const dropdownIsOpen = Cell.source(false)
   const select = Cell.source<HTMLSelectElement | null>(null)
   const contextMenu = Cell.source<HTMLMenuElement | null>(null)
   const caretDirection = Cell.derived(() => {
      return dropdownIsOpen.get() ? 'top' : 'bottom'
   })
   const selectedOption = Cell.source(
      outerSelectedOption ? outerSelectedOption.get() : options.get().at(0)
   )

   const handleStateChange = (state: ContextMenuState) => {
      dropdownIsOpen.set(state === 'open')
   }

   const DropdownItem = (option: DropdownOption<T>) => {
      const containerRef = Cell.source<HTMLElement | null>(null)
      const isSelected = Cell.derived(() => {
         const selected = selectedOption.get()
         return selected && option.value === selected.value
      })

      observer.onConnected(containerRef, (container) => {
         if (isSelected.get()) {
            container.scrollIntoView({ behavior: 'instant' })
         }
      })

      return {
         type: ItemTypes.Action,
         label: () => {
            return (
               <div ref={containerRef} class={styles.option}>
                  {If(isSelected, () => {
                     return <Checkmark class={styles.checkmark} />
                  })}
                  <span class={styles.label}>{option.label}</span>
               </div>
            )
         },
         onClick() {
            selectedOption.set(option)
         }
      }
   }

   const items = Cell.derived<ContextMenuItemProps[]>(() => {
      return options.get().map(DropdownItem)
   })

   let buffer = ''
   let bufferTimeout: NodeJS.Timeout | null = null

   const resetBufferTimeout = () => {
      if (bufferTimeout) {
         clearTimeout(bufferTimeout)
      }
      bufferTimeout = setTimeout(() => {
         buffer = ''
      }, SEARCH_BUFFER_TIMEOUT_MS)
   }

   const handleKeydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
         return
      }
      resetBufferTimeout()
      const searchQuery = event.key.toLowerCase()
      buffer += searchQuery
      const contextMenuElement = contextMenu.get()
      const matchingOptionIdx = options.get().findIndex((option) => {
         return option.label.toLowerCase().startsWith(buffer)
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
      outerSelectedOption?.set(option)
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
               return <option value={String(option.value)}>{option.label}</option>
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
