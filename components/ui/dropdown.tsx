import { getFocusableElementInItem, groupByCount } from '@/utilities/miscellaneous'
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
   chunkSize?: JSX.ValueOrCell<number>
   'list:class'?: unknown
}

export function Dropdown<T extends PropertyKey>(props: DropdownProps<T>) {
   const {
      options: optionsProp,
      selectedOption: outerSelected,
      'list:class': listClass,
      chunkSize: chunkSizeProp,
      ...rest
   } = props

   const observer = useObserver()
   const options = useDerivedValue(optionsProp)
   const chunkSize = useDerivedValue(chunkSizeProp)
   const dropdownIsOpen = Cell.source(false)
   const select = Cell.source<HTMLSelectElement | null>(null)
   const contextMenu = Cell.source<HTMLMenuElement | null>(null)
   const selectedOption = Cell.source(outerSelected ? outerSelected.get() : options.get().at(0))
   const initialSelect = selectedOption.get()
   const initialChunkSize = chunkSize.get()
   const matchingOption = initialSelect
      ? options.get().findIndex((option) => option.value === initialSelect.value)
      : undefined
   const cursor = Cell.source(
      matchingOption && initialChunkSize ? Math.floor(matchingOption / initialChunkSize) : 0
   )
   let infiniteScrollIntersectionObserver: IntersectionObserver
   const caretDirection = Cell.derived(() => {
      return dropdownIsOpen.get() ? 'top' : 'bottom'
   })

   const renderDropdownOption = (
      option: DropdownOption<T>,
      indexInChunk: number
   ): ContextMenuItemProps => {
      const isSelected = Cell.derived(() => {
         const selected = selectedOption.get()
         return selected && option.value === selected.value
      })

      const Label = () => {
         const containerRef = Cell.source<HTMLElement | null>(null)
         observer.onConnected(containerRef, (container) => {
            if (isSelected.get()) {
               container.scrollIntoView({ behavior: 'instant', block: 'center' })
            }

            const size = chunkSize.get()
            if (size === undefined) {
               return
            }
            const isLastOrPenultimateItemInChunk =
               indexInChunk > 0 && (indexInChunk % size === 0 || indexInChunk % size === size - 1)
            if (!isLastOrPenultimateItemInChunk) {
               return
            }

            const handleVisibilityChange = (event: Event) => {
               const chunkSizeValue = chunkSize.get()
               if (!(event instanceof OptionVisibilityEvent) || chunkSizeValue === undefined) {
                  return
               }
               const index = options.get().indexOf(option)
               const optionChunkIndex = Math.floor(index / chunkSizeValue)
               const currentShownChunk = cursor.get()
               if (optionChunkIndex >= currentShownChunk) {
                  cursor.set(optionChunkIndex - 1)
               }
            }

            container.addEventListener(OptionVisibilityEvent.eventName, handleVisibilityChange)
            infiniteScrollIntersectionObserver.observe(container)

            return () => {
               container.removeEventListener(
                  OptionVisibilityEvent.eventName,
                  handleVisibilityChange
               )
               infiniteScrollIntersectionObserver.unobserve(container)
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

      return {
         type: ItemTypes.Action,
         label: Label,
         onClick() {
            selectedOption.set(option)
         }
      }
   }

   const chunks = Cell.derived(() => {
      return groupByCount(options.get().map(renderDropdownOption), chunkSize.get())
   })

   const visibleOptions = Cell.derived(() => {
      return chunks
         .get()
         .slice(0, cursor.get() + 3)
         .flat()
   })
   const items = Cell.derived<ContextMenuItemProps[]>(() => {
      return visibleOptions.get()
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

   const handleStateChange = (state: ContextMenuState) => {
      dropdownIsOpen.set(state === 'open')
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

   observer.onConnected(contextMenu, (contextMenu) => {
      const options = { root: contextMenu, threshold: 1 }
      infiniteScrollIntersectionObserver = new IntersectionObserver((entries) => {
         for (const entry of entries) {
            if (chunkSize.get() && entry.isIntersecting) {
               const target = entry.target as HTMLElement
               target.dispatchEvent(new OptionVisibilityEvent())
            }
         }
      }, options)

      return () => {
         infiniteScrollIntersectionObserver.disconnect()
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

export class OptionVisibilityEvent extends Event {
   static eventName = '__visible'
   constructor() {
      super(OptionVisibilityEvent.eventName)
   }
}
