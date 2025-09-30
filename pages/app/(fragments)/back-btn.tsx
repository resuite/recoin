import Arrows from '@/components/icons/svg/arrows'
import type { JSX } from 'retend/jsx-runtime'
import { useRouter } from 'retend/router'

type ButtonProps = JSX.IntrinsicElements['button']
interface BackButtonProps extends ButtonProps {}

export function BackButton(props: BackButtonProps) {
   const { type = 'button', class: className, ...rest } = props
   const router = useRouter()
   return (
      <button
         {...rest}
         type={type}
         class={['button-bare text-big gap-0.25', className]}
         onClick={() => router.back()}
      >
         <Arrows class='h-1 rotate-45' />
         Back
      </button>
   )
}
