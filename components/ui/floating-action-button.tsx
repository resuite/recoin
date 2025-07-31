import { Cell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './floating-action-button.module.css'

type ButtonProps = JSX.IntrinsicElements['button']

/**
 * Props for the FloatingActionButton component.
 */
export interface FloatingActionButtonProps extends ButtonProps {
   /**
    * The vertical position of the button. Can be "top", "bottom", or "center". Defaults to "bottom".
    */
   block?: JSX.ValueOrCell<'top' | 'bottom' | 'center'>
   /**
    * The horizontal position of the button. Can be "left", "right", or "center". Defaults to "center".
    */
   inline?: JSX.ValueOrCell<'left' | 'right' | 'center'>
   /**
    * Whether the button should be outlined. Defaults to false.
    */
   outlined?: JSX.ValueOrCell<boolean>
}

/**
 * A floating action button component.
 * It automatically styles svg icons placed inside it.
 *
 * @param props - The component props.
 * @returns A floating action button element.
 *
 * @example
 * ```tsx
 * <FloatingActionButton onClick={() => alert('Button clicked!')}>
 *   <Icon name="add" />
 * </FloatingActionButton>
 * ```
 */
export function FloatingActionButton(props: FloatingActionButtonProps) {
   const {
      block: blockProp = 'bottom',
      inline: inlineProp = 'center',
      outlined: outlinedProp = false,
      ...rest
   } = props

   const block = useDerivedValue(blockProp)
   const inline = useDerivedValue(inlineProp)
   const isOutlined = useDerivedValue(outlinedProp)

   const blockClass = Cell.derived(() => {
      return [styles.block, styles[block.get()]].join(' ')
   })
   const inlineClass = Cell.derived(() => {
      return [styles.inline, styles[inline.get()]].join(' ')
   })

   return (
      <button
         {...rest}
         data-outlined={isOutlined}
         class={[styles.floatingActionButton, blockClass, inlineClass, rest.class]}
      >
         {props.children}
      </button>
   )
}
