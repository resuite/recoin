import type { JSX } from 'retend/jsx-runtime'
import styles from './button.module.css'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface ButtonProps extends IntrinsicButtonProps {}

export function Button(props: ButtonProps) {
   const { type = 'button', class: className, ...rest } = props
   return <button {...rest} type={type} class={[styles.button, className]} />
}
