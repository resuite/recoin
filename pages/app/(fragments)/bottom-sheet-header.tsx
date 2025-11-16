import type { JSX } from 'retend/jsx-runtime'

type DivProps = JSX.IntrinsicElements['div']
interface BottomSheetHeaderProps extends DivProps {
   text?: JSX.Template
   subText: JSX.Template
   children?: JSX.Children
}

export function BottomSheetHeader(props: BottomSheetHeaderProps) {
   const { text, subText, children, ...rest } = props
   return (
      <div {...rest}>
         <h2 class='text-bigger'>{text ?? children}</h2>
         {subText && <sub class='text-normal'>{subText}</sub>}
      </div>
   )
}
