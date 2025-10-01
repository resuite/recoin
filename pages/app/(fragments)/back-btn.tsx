import Arrows from '@/components/icons/svg/arrows'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { useRouter } from 'retend/router'

type ButtonProps = JSX.IntrinsicElements['button']
interface BackButtonProps extends ButtonProps {
   href?: JSX.ValueOrCell<string>
}

export function BackButton(props: BackButtonProps) {
   const { type = 'button', class: className, href: hrefProp, ...rest } = props
   const router = useRouter()
   const href = useDerivedValue(hrefProp)

   const handleClick = () => {
      const hrefValue = href.get()
      if (hrefValue) {
         router.navigate(hrefValue)
      } else {
         router.back()
      }
   }

   return (
      <button
         {...rest}
         type={type}
         class={['button-bare text-big gap-0.25', className]}
         onClick={handleClick}
      >
         <Arrows class='h-1 rotate-45' />
         Back
      </button>
   )
}
