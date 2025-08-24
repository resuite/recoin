import type { JSX } from 'retend/jsx-runtime'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface ButtonProps extends IntrinsicButtonProps {}

export function Button(props: ButtonProps) {
   return <button {...props} />
}
