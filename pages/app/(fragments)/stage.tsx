import type { JSX } from 'retend/jsx-runtime'

type DivProps = JSX.IntrinsicElements['div']
interface StageProps extends DivProps {}

export const Stage = (props: StageProps) => {
   return (
      <div
         {...props}
         class={[
            'translate-0 h-full max-w-screen light-scheme rounded-t-3xl',
            'duration-bit-slower transition-transform ease',

            props.class
         ]}
      />
   )
}
