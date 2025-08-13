import { Cell, For, type SourceCell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import Caret from '../icons/svg/caret'
import {
   ContextMenu,
   type ContextMenuItemProps,
   type ContextMenuState,
   ItemTypes
} from './context-menu'
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
      selectedOption: outerSelectedOption,
      'list:class': listClass,
      ...rest
   } = props

   const options = useDerivedValue(optionsProp)
   const dropdownIsOpen = Cell.source(false)
   const caretDirection = Cell.derived(() => (dropdownIsOpen.get() ? 'top' : 'bottom'))
   const select = Cell.source<HTMLSelectElement | null>(null)
   const popover = Cell.source<HTMLMenuElement | null>(null)
   const selectedOption = Cell.source(
      outerSelectedOption ? outerSelectedOption.get() : options.get().at(0)
   )

   const handleStateChange = (state: ContextMenuState) => {
      dropdownIsOpen.set(state === 'open')
   }

   const items = Cell.derived<ContextMenuItemProps[]>(() => {
      return options.get().map((option) => {
         return {
            type: ItemTypes.Action,
            label: option.label,
            onClick() {
               selectedOption.set(option)
            }
         }
      })
   })

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
            ref={popover}
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
