import type { JSX } from "retend/jsx-runtime";

type IntrinsicButtonProps = JSX.IntrinsicElements["button"];

export interface ButtonProps extends IntrinsicButtonProps {}

export function Button(props: ButtonProps) {
   const { children, ...rest } = props;

   return <button {...rest}>{children}</button>;
}
