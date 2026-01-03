import { If } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { Input as _Input, type InputProps as _InputProps } from 'retend-utils/components'
import styles from './input.module.css'

export interface InputProps<T extends JSX.InputTypeHTMLAttribute> extends _InputProps<T> {
   label?: JSX.ValueOrCell<string>
}

export function Input<T extends JSX.InputTypeHTMLAttribute>(props: InputProps<T>) {
   const { label, ...rest } = props
   return (
      <label>
         {If(label, (label) => (
            <span class={styles.label}>{label}</span>
         ))}
         <_Input {...rest} class={[styles.input, rest.class]} />
      </label>
   )
}
